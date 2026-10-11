import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIntl } from 'react-intl';
import { RootStackParamList } from '../../types/navigation';
import { ScreenBackground } from '../../components/ScreenBackground/ScreenBackground';
import { ScreenHeader } from '../../components/ScreenHeader/ScreenHeader';
import { UserNameModal } from '../../components/UserNameModal/UserNameModal';
import { ConfettiOverlay } from '../../components/ConfettiOverlay/ConfettiOverlay';
import { TrophyIcon } from '../../components/TrophyIcon/TrophyIcon';
import { useAppTheme } from '../../context/ThemeContext';
import { soundService } from '../../services/soundService';
import { trackEvent } from '../../services/analyticsService';
import { updateSettings } from '../../services/settingsService';
import {
  LeaderboardEntry,
  PastChampion,
  UserRankInfo,
  fetchMonthlyLeaderboard,
  fetchAllTimeLeaderboard,
  fetchPastChampions,
  getUserMonthlyRank,
  getUserAllTimeRank,
  getMonthlyParticipantCount,
  getAllTimeParticipantCount,
  getStoredDisplayName,
  updateDisplayName,
  ensureAuthenticated,
  isLeaderboardHistoryTabEnabled,
} from '../../services/leaderboardService';
import { createStyles } from './LeaderboardScreen.styles';

type LeaderboardNavProp = NativeStackNavigationProp<RootStackParamList, 'Leaderboard'>;
type TabType = 'monthly' | 'alltime' | 'history';

export function LeaderboardScreen(): React.JSX.Element {
  const intl = useIntl();
  const navigation = useNavigation<LeaderboardNavProp>();
  const { colors, isDark } = useAppTheme();
  const styles = useMemo(() => createStyles(colors, isDark), [colors, isDark]);

  const [activeTab, setActiveTab] = useState<TabType>('monthly');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [monthlyList, setMonthlyList] = useState<LeaderboardEntry[]>([]);
  const [alltimeList, setAlltimeList] = useState<LeaderboardEntry[]>([]);
  const [historyList, setHistoryList] = useState<PastChampion[]>([]);
  const [userRankInfo, setUserRankInfo] = useState<UserRankInfo | null>(null);

  const [monthlyCount, setMonthlyCount] = useState<number>(0);
  const [alltimeCount, setAlltimeCount] = useState<number>(0);

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [showNameModal, setShowNameModal] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const flatListRef = useRef<FlatList<LeaderboardEntry>>(null);

  useEffect(() => {
    trackEvent('leaderboard_screen_shown');
  }, []);

  useEffect(() => {
    if (
      !loading &&
      (activeTab === 'monthly' || activeTab === 'alltime') &&
      userRankInfo &&
      currentUserId
    ) {
      const timer = setTimeout(() => {
        const currentList = activeTab === 'monthly' ? monthlyList : alltimeList;
        if (userRankInfo.inTop20) {
          const slicedList = currentList.slice(3);
          const targetIndex = slicedList.findIndex(item => item.userId === currentUserId);
          if (targetIndex >= 0) {
            flatListRef.current?.scrollToIndex({
              index: targetIndex,
              animated: true,
              viewPosition: 0.5,
            });
          }
        } else {
          flatListRef.current?.scrollToEnd({ animated: true });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, activeTab, userRankInfo, currentUserId, monthlyList, alltimeList]);

  const loadData = useCallback(
    async (bypassCache = false) => {
      try {
        setLoading(true);
        const uid = await ensureAuthenticated();
        setCurrentUserId(uid);

        if (!getStoredDisplayName()) {
          setShowNameModal(true);
        }

        if (activeTab === 'monthly') {
          const [mList, rInfo, mCount, hList] = await Promise.all([
            fetchMonthlyLeaderboard(undefined, bypassCache),
            getUserMonthlyRank(),
            getMonthlyParticipantCount(),
            fetchPastChampions(bypassCache),
          ]);
          setMonthlyList(mList);
          setUserRankInfo(rInfo);
          setMonthlyCount(mCount);
          setHistoryList(hList);
          if (rInfo?.rank === 1 || (mList.length > 0 && mList[0].userId === uid)) {
            setShowConfetti(true);
          }
        } else if (activeTab === 'alltime') {
          const [aList, rInfo, aCount] = await Promise.all([
            fetchAllTimeLeaderboard(bypassCache),
            getUserAllTimeRank(),
            getAllTimeParticipantCount(),
          ]);
          setAlltimeList(aList);
          setUserRankInfo(rInfo);
          setAlltimeCount(aCount);
        } else if (activeTab === 'history') {
          const hList = await fetchPastChampions(bypassCache);
          setHistoryList(hList);
          setUserRankInfo(null);
        }
      } catch (error) {
        console.error('[LeaderboardScreen] Error loading data:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleSaveName = async (newName: string) => {
    setShowNameModal(false);
    await updateDisplayName(newName);
    updateSettings({ hasPromptedNameOnLaunch: true });
    loadData(true);
  };

  const handleTabSwitch = (tab: TabType) => {
    soundService.playTapSound();
    setActiveTab(tab);
  };

  const getPodiumDisplayName = (entry?: LeaderboardEntry) => {
    if (!entry) return 'Open Slot';
    const isCustom = entry.displayName && entry.displayName.trim().length > 0;
    return isCustom ? entry.displayName.trim() : 'Learner';
  };

  const renderPodium = (list: LeaderboardEntry[]) => {
    const goldName = getPodiumDisplayName(list[0]);
    const silverName = getPodiumDisplayName(list[1]);
    const bronzeName = getPodiumDisplayName(list[2]);

    const isGoldUser = list[0] && list[0].userId === currentUserId;
    const isSilverUser = list[1] && list[1].userId === currentUserId;
    const isBronzeUser = list[2] && list[2].userId === currentUserId;

    return (
      <View style={styles.podiumContainer}>
        {/* Silver 2nd Place */}
        <TouchableOpacity
          style={[styles.podiumCard, isSilverUser && styles.currentUserRow]}
          onPress={() => isSilverUser && setShowNameModal(true)}
          activeOpacity={isSilverUser ? 0.7 : 1}
        >
          <Text style={styles.medalBadge}>🥈</Text>
          <Text style={styles.podiumName} numberOfLines={1}>
            {silverName}
          </Text>
          <Text style={styles.podiumScore}>{list[1] ? list[1].score : 0} pts</Text>
        </TouchableOpacity>

        {/* Gold 1st Place */}
        <TouchableOpacity
          style={[styles.podiumCard, styles.firstPlaceCard, isGoldUser && styles.currentUserRow]}
          onPress={() => isGoldUser && setShowNameModal(true)}
          activeOpacity={isGoldUser ? 0.7 : 1}
        >
          <Text style={styles.medalBadge}>🏆</Text>
          <Text style={styles.podiumName} numberOfLines={1}>
            {goldName}
          </Text>
          <Text style={styles.podiumScore}>{list[0] ? list[0].score : 0} pts</Text>
        </TouchableOpacity>

        {/* Bronze 3rd Place */}
        <TouchableOpacity
          style={[styles.podiumCard, isBronzeUser && styles.currentUserRow]}
          onPress={() => isBronzeUser && setShowNameModal(true)}
          activeOpacity={isBronzeUser ? 0.7 : 1}
        >
          <Text style={styles.medalBadge}>🥉</Text>
          <Text style={styles.podiumName} numberOfLines={1}>
            {bronzeName}
          </Text>
          <Text style={styles.podiumScore}>{list[2] ? list[2].score : 0} pts</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderRankItem = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isCurrentUser = item.userId === currentUserId;
    const rankNum = index + 4;
    const displayNameText =
      item.displayName && item.displayName.trim().length > 0 ? item.displayName.trim() : 'Learner';

    return (
      <TouchableOpacity
        style={[styles.rankRow, isCurrentUser && styles.currentUserRow]}
        onPress={() => isCurrentUser && setShowNameModal(true)}
        activeOpacity={isCurrentUser ? 0.7 : 1}
      >
        <Text style={styles.rankNumber}>#{rankNum}</Text>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {displayNameText}
          </Text>
        </View>
        <Text style={styles.userScore}>{item.score} pts</Text>
      </TouchableOpacity>
    );
  };

  const maxHistoryScore = useMemo(() => {
    if (historyList.length === 0) return -1;
    return Math.max(...historyList.map(item => item.winnerScore));
  }, [historyList]);

  const renderHistoryItem = ({ item }: { item: PastChampion }) => {
    const isHighest = item.winnerScore === maxHistoryScore && maxHistoryScore > 0;
    return (
      <View style={[styles.rankRow, isHighest && styles.highestScoreRow]}>
        {isHighest && (
          <View style={styles.highestScoreBadgeContainer} pointerEvents="none">
            <View style={styles.highestScoreBadge}>
              <Text style={styles.highestScoreBadgeText}>
                {intl.formatMessage({ id: 'leaderboard.highestScore' })}
              </Text>
            </View>
          </View>
        )}
        <Text style={styles.historyMonthText}>{item.monthLabel}</Text>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.winnerName}
          </Text>
        </View>
        <Text style={styles.userScore}>{item.winnerScore} pts</Text>
      </View>
    );
  };

  const titleText = intl.formatMessage({ id: 'leaderboard.title' });
  const emptyTitleText = intl.formatMessage({ id: 'leaderboard.emptyTitle' });
  const emptySubtitleText = intl.formatMessage({ id: 'leaderboard.emptySubtitle' });
  const tabThisMonthText = intl.formatMessage({ id: 'leaderboard.tabThisMonth' });
  const tabYearText = intl.formatMessage({ id: 'leaderboard.tabYear' });
  const tabAllTimeText = intl.formatMessage({ id: 'leaderboard.tabAllTime' });

  const renderListContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (activeTab === 'monthly') {
      if (monthlyList.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <TrophyIcon size={56} isRanked={true} isDark={isDark} />
            </View>
            <Text style={styles.emptyTitle}>{emptyTitleText}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitleText}</Text>
          </View>
        );
      }
      return (
        <>
          {renderPodium(monthlyList)}
          <FlatList
            ref={flatListRef}
            data={monthlyList.slice(3)}
            keyExtractor={item => item.userId}
            renderItem={renderRankItem}
            ListFooterComponent={() =>
              userRankInfo && !userRankInfo.inTop20 && userRankInfo.rank > 21 ? (
                <View style={styles.skippedEllipsisContainer}>
                  <Text style={styles.skippedEllipsisText}>•••</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={info => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </>
      );
    }

    if (activeTab === 'alltime') {
      if (alltimeList.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <TrophyIcon size={56} isRanked={true} isDark={isDark} />
            </View>
            <Text style={styles.emptyTitle}>{emptyTitleText}</Text>
          </View>
        );
      }
      return (
        <>
          {renderPodium(alltimeList)}
          <FlatList
            ref={flatListRef}
            data={alltimeList.slice(3)}
            keyExtractor={item => item.userId}
            renderItem={renderRankItem}
            ListFooterComponent={() =>
              userRankInfo && !userRankInfo.inTop20 && userRankInfo.rank > 21 ? (
                <View style={styles.skippedEllipsisContainer}>
                  <Text style={styles.skippedEllipsisText}>•••</Text>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onScrollToIndexFailed={info => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.primary}
              />
            }
          />
        </>
      );
    }

    if (historyList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <TrophyIcon size={56} isRanked={true} isDark={isDark} />
          </View>
          <Text style={styles.emptyTitle}>{emptyTitleText}</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={historyList}
        keyExtractor={item => item.yearMonth}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      />
    );
  };

  return (
    <ScreenBackground>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenHeader
        title={titleText}
        showBackButton
        onBackPress={() => navigation.goBack()}
        showLeaderboard={false}
      />

      <View style={styles.contentWrapper}>
        {/* Segmented Control Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'monthly' && styles.activeTabItem]}
            onPress={() => handleTabSwitch('monthly')}
          >
            <Text style={[styles.tabText, activeTab === 'monthly' && styles.activeTabText]}>
              {tabThisMonthText}
            </Text>
          </TouchableOpacity>

          {isLeaderboardHistoryTabEnabled() && (
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'history' && styles.activeTabItem]}
              onPress={() => handleTabSwitch('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                {tabYearText}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'alltime' && styles.activeTabItem]}
            onPress={() => handleTabSwitch('alltime')}
          >
            <Text style={[styles.tabText, activeTab === 'alltime' && styles.activeTabText]}>
              {tabAllTimeText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>{renderListContent()}</View>

        {/* Sticky Bottom Rank Bar for Monthly & All-Time Tab if outside Top 20 */}
        {(activeTab === 'monthly' || activeTab === 'alltime') &&
          userRankInfo &&
          !userRankInfo.inTop20 && (
            <TouchableOpacity
              style={[styles.rankRow, styles.currentUserRow, styles.stickyBottomBar]}
              onPress={() => {
                soundService.playTapSound();
                setShowNameModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.rankNumber}>#{userRankInfo.rank}</Text>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName} numberOfLines={1}>
                  {userRankInfo.displayName || getStoredDisplayName() || 'Learner'}
                </Text>
              </View>
              <Text style={styles.userScore}>{userRankInfo.score} pts</Text>
            </TouchableOpacity>
          )}

        {/* Participant Count Footer */}
        {((activeTab === 'monthly' && monthlyCount > 0) ||
          (activeTab === 'alltime' && alltimeCount > 0)) && (
          <View style={styles.footerCountContainer}>
            <Text style={styles.participantCountText}>
              {intl.formatMessage(
                { id: 'leaderboard.totalParticipants' },
                { count: activeTab === 'monthly' ? monthlyCount : alltimeCount },
              )}
            </Text>
          </View>
        )}
      </View>

      <UserNameModal
        visible={showNameModal}
        initialValue={getStoredDisplayName()}
        onSave={handleSaveName}
        onClose={() => setShowNameModal(false)}
      />

      {showConfetti && (
        <ConfettiOverlay count={150} onAnimationEnd={() => setShowConfetti(false)} />
      )}
    </ScreenBackground>
  );
}
