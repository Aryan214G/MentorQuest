import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  Avatar,
  Table,
  Button,
  Pagination,
  Alert,
  Paper
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Leaderboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [pagination.current]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/user/leaderboard?page=${pagination.current}&limit=50`);
      setLeaderboard(response.data.leaderboard || []);
      setPagination(response.data.pagination || { current: 1, total: 1 });
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const getRankBadgeColor = (rank) => {
    if (rank === 1) return 'yellow'; // Gold
    if (rank === 2) return 'gray';   // Silver
    if (rank === 3) return 'orange'; // Bronze
    return 'blue';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏅';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Find current user's position in leaderboard
  const currentUserRank = leaderboard.find(entry => entry._id === user?._id);

  return (
    <Container size="lg" p={{ base: 'xs', sm: 'md' }} style={{ textAlign: 'center' }}>
      {/* Header */}
      <Stack gap="md" mb={{ base: 'lg', sm: 'xl' }} align="center">
        {/* Mobile Header */}
        <Card shadow="sm" padding="md" radius="md" withBorder hiddenFrom="md">
          <Group justify="center" align="center" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <Title order={2} size="h3">🏆 Leaderboard</Title>
              <Text c="dimmed" size="sm">See how you rank</Text>
            </div>
            <Button variant="filled" color="red" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Card>

        {/* Desktop Header */}
        <Group justify="center" visibleFrom="md" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Title order={1}>🏆 Leaderboard</Title>
            <Text c="dimmed">See how you rank against other students</Text>
          </div>
          
          <Group>
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
              Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/questions')}>
              Questions
            </Button>
            <Button variant="outline" onClick={() => navigate('/student/profile')}>
              Profile
            </Button>
            <Button variant="filled" color="red" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>

        {/* Mobile Navigation */}
        <Group hiddenFrom="md" gap="xs" justify="center">
          <Button variant="outline" size="xs" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </Button>
          <Button variant="outline" size="xs" onClick={() => navigate('/student/questions')}>
            Questions
          </Button>
          <Button variant="outline" size="xs" onClick={() => navigate('/student/profile')}>
            Profile
          </Button>
        </Group>
      </Stack>

      {/* Current User Stats */}
      {currentUserRank && (
        <Paper p="lg" mb="xl" withBorder>
          <Group justify="space-between">
            <Group>
              <Avatar size="lg" radius="xl" src={user?.avatar} />
              <div>
                <Group gap="xs">
                  <Text fw={500}>Your Rank: #{currentUserRank.rank}</Text>
                  <Badge color={getRankBadgeColor(currentUserRank.rank)}>
                    {getRankIcon(currentUserRank.rank)}
                  </Badge>
                </Group>
                <Text c="dimmed">{user?.name}</Text>
              </div>
            </Group>
            <Group>
              <div style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed">Points</Text>
                <Text fw={700} size="lg">{currentUserRank.totalPoints}</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="sm" c="dimmed">Streak</Text>
                <Text fw={700} size="lg">{currentUserRank.currentStreak}</Text>
              </div>
            </Group>
          </Group>
        </Paper>
      )}

      {/* Leaderboard */}
      <Card shadow="sm" padding={{ base: 'md', sm: 'lg' }} radius="md" withBorder>
        <Title order={3} mb="md" size={{ base: 'h4', sm: 'h3' }}>Top Performers</Title>
        
        {loading ? (
          <Alert>Loading leaderboard...</Alert>
        ) : leaderboard.length > 0 ? (
          <>
            {/* Desktop Table */}
            <Table highlightOnHover visibleFrom="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Rank</Table.Th>
                  <Table.Th>Student</Table.Th>
                  <Table.Th>Points</Table.Th>
                  <Table.Th>Current Streak</Table.Th>
                  <Table.Th>Max Streak</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {leaderboard.map((entry, index) => (
                  <Table.Tr 
                    key={entry._id}
                    style={{
                      backgroundColor: entry._id === user?._id ? '#f0f9ff' : undefined,
                      fontWeight: entry._id === user?._id ? 500 : 400
                    }}
                  >
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={700} size="lg">
                          #{entry.rank}
                        </Text>
                        {entry.rank <= 3 && (
                          <span style={{ fontSize: '20px' }}>
                            {getRankIcon(entry.rank)}
                          </span>
                        )}
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group>
                        <Avatar 
                          size="md" 
                          radius="xl" 
                          src={entry.avatar}
                        />
                        <div>
                          <Text fw={500}>{entry.name}</Text>
                          {entry._id === user?._id && (
                            <Badge size="xs" color="blue">You</Badge>
                          )}
                        </div>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={700} size="lg" c="blue">
                          {entry.totalPoints}
                        </Text>
                        <Text size="sm" c="dimmed">pts</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <span style={{ fontSize: '16px' }}>🔥</span>
                        <Text fw={500}>
                          {entry.currentStreak}
                        </Text>
                        <Text size="sm" c="dimmed">days</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Text fw={500}>
                          {entry.maxStreak}
                        </Text>
                        <Text size="sm" c="dimmed">days</Text>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {/* Mobile Cards */}
            <Stack gap="sm" hiddenFrom="md">
              {leaderboard.map((entry) => (
                <Card 
                  key={entry._id} 
                  p="md" 
                  withBorder
                  style={{
                    backgroundColor: entry._id === user?._id ? '#f0f9ff' : undefined,
                    border: entry._id === user?._id ? '2px solid #228be6' : undefined
                  }}
                >
                  <Group justify="space-between" align="center">
                    <Group>
                      <div style={{ textAlign: 'center', minWidth: '50px' }}>
                        <Text fw={700} size="lg">#{entry.rank}</Text>
                        {entry.rank <= 3 && (
                          <div style={{ fontSize: '16px' }}>
                            {getRankIcon(entry.rank)}
                          </div>
                        )}
                      </div>
                      <Avatar 
                        size="sm" 
                        radius="xl" 
                        src={entry.avatar}
                      />
                      <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500} size="sm" lineClamp={1}>
                          {entry.name}
                        </Text>
                        <Group gap="xs" wrap="wrap">
                          <Badge color="blue" size="xs">
                            {entry.totalPoints} pts
                          </Badge>
                          <Badge color="orange" size="xs">
                            🔥 {entry.currentStreak}d
                          </Badge>
                          <Badge color="gray" size="xs">
                            Max: {entry.maxStreak}d
                          </Badge>
                        </Group>
                      </Stack>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>

            {/* Pagination */}
            {pagination.total > 1 && (
              <Group justify="center" mt="xl">
                <Pagination
                  value={pagination.current}
                  onChange={handlePageChange}
                  total={pagination.total}
                  size={{ base: 'sm', sm: 'md' }}
                />
              </Group>
            )}

            {/* Motivational Message */}
            <Paper p="md" mt="xl" style={{ backgroundColor: '#f8f9fa' }}>
              <Group justify="center">
                <div style={{ textAlign: 'center' }}>
                  <Text size="sm" c="dimmed">
                    💡 Keep solving problems to climb up the leaderboard!
                  </Text>
                  {!currentUserRank && (
                    <Text size="sm" c="dimmed">
                      Solve your first problem to appear on the leaderboard.
                    </Text>
                  )}
                </div>
              </Group>
            </Paper>
          </>
        ) : (
          <Alert>
            <Text>No leaderboard data available yet.</Text>
            <Button 
              variant="light" 
              mt="sm" 
              onClick={() => navigate('/student/questions')}
            >
              Start Solving Problems
            </Button>
          </Alert>
        )}
      </Card>
    </Container>
  );
}