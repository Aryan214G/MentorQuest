import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Badge,
  Group,
  Stack,
  TextInput,
  Select,
  MultiSelect,
  Button,
  Pagination,
  Alert,
  ActionIcon,
  Menu
} from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function Questions() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, total: 1 });
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    status: '',
    tags: []
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
    fetchTags();
  }, [filters, pagination.current]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: pagination.current,
        limit: 12,
        ...filters,
        tags: filters.tags.join(',')
      });
      
      console.log('Fetching questions with URL:', `/user/questions?${params}`);
      const response = await axios.get(`/user/questions?${params}`);
      console.log('Questions response:', response.data);
      setQuestions(response.data.questions || []);
      setPagination(response.data.pagination || { current: 1, total: 1 });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      setError('Failed to load questions. Please try again.');
      // Set empty questions array on error to prevent blank page
      setQuestions([]);
      setPagination({ current: 1, total: 1 });
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      // We'll get tags from questions for now
      const response = await axios.get('/user/questions?limit=1000');
      const allTags = new Set();
      response.data.questions?.forEach(q => {
        q.tags?.forEach(tag => allTags.add(tag));
      });
      setAvailableTags(Array.from(allTags).map(tag => ({ value: tag, label: tag })));
      console.log('Available tags:', Array.from(allTags));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setAvailableTags([]);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, current: page }));
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'cakewalk': 'green',
      'easy': 'blue',
      'easy-medium': 'yellow',
      'medium': 'orange',
      'hard': 'red'
    };
    return colors[difficulty] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      'solved': 'green',
      'attempted': 'orange',
      'not_attempted': 'gray'
    };
    return colors[status] || 'gray';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Container size="xl" px={{ base: 'sm', sm: 'md' }} style={{ textAlign: 'center' }}>
        <Alert>Loading questions...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl" px={{ base: 'sm', sm: 'md' }} style={{ textAlign: 'center' }}>
        <Alert color="red" title="Error">
          {error}
          <Button variant="light" mt="sm" onClick={() => {
            setError(null);
            fetchQuestions();
          }}>
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" px={{ base: 'sm', sm: 'md' }} style={{ textAlign: 'center' }}>
      {/* Header */}
      <Stack mb={{ base: 'lg', sm: 'xl' }} align="center">
        <Group justify="center" style={{ flexDirection: 'column', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <Title order={1} size="h1">Questions</Title>
            <Text c="dimmed" size="md">Browse and solve coding problems</Text>
          </div>
          
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button variant="outline" size="sm">
                Menu
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={() => navigate('/student/dashboard')}>
                Dashboard
              </Menu.Item>
              <Menu.Item onClick={() => navigate('/student/leaderboard')}>
                Leaderboard
              </Menu.Item>
              <Menu.Item onClick={() => navigate('/student/profile')}>
                Profile
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item color="red" onClick={handleLogout}>
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
        
        {/* Desktop Navigation - Hidden on mobile */}
        <Group visibleFrom="sm" justify="flex-end">
          <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
            Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/student/leaderboard')}>
            Leaderboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/student/profile')}>
            Profile
          </Button>
          <Button variant="filled" color="red" onClick={handleLogout}>
            Logout
          </Button>
        </Group>
      </Stack>

      {/* Filters */}
      <Card shadow="sm" padding={{ base: 'md', sm: 'lg' }} radius="md" withBorder mb={{ base: 'lg', sm: 'xl' }}>
        <Stack gap="md">
          {/* Mobile-first filter layout */}
          <TextInput
            label="Search"
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Difficulty"
                placeholder="All"
                value={filters.difficulty}
                onChange={(value) => handleFilterChange('difficulty', value)}
                data={[
                  { value: '', label: 'All' },
                  { value: 'cakewalk', label: 'Cakewalk' },
                  { value: 'easy', label: 'Easy' },
                  { value: 'easy-medium', label: 'Easy-Medium' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'hard', label: 'Hard' }
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Status"
                placeholder="All"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                data={[
                  { value: '', label: 'All' },
                  { value: 'solved', label: 'Solved' },
                  { value: 'attempted', label: 'Attempted' },
                  { value: 'not_attempted', label: 'Not Attempted' }
                ]}
              />
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 6 }}>
              <MultiSelect
                label="Tags"
                placeholder="Select tags"
                value={filters.tags}
                onChange={(value) => handleFilterChange('tags', value)}
                data={availableTags}
                searchable
              />
            </Grid.Col>
          </Grid>

          <Button onClick={fetchQuestions} loading={loading} size="md">
            Apply Filters
          </Button>
        </Stack>
      </Card>

      {/* Questions Grid */}
      {loading ? (
        <Alert>Loading questions...</Alert>
      ) : questions.length > 0 ? (
        <>
          <Grid gutter={{ base: 'sm', sm: 'md' }}>
            {questions.map((question) => (
              <Grid.Col key={question._id} span={{ base: 12, sm: 6, lg: 4 }}>
                <Card
                  shadow="sm"
                  padding={{ base: 'md', sm: 'lg' }}
                  radius="md"
                  withBorder
                  style={{ height: '100%', cursor: 'pointer' }}
                  onClick={() => navigate(`/student/questions/${question._id}`)}
                >
                  <Stack gap="sm">
                    <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                      <Text fw={500} lineClamp={1} size="md">
                        {question.title}
                      </Text>
                      <Badge color={getStatusColor(question.studentStatus)} size="sm">
                        {question.studentStatus?.replace('_', ' ')}
                      </Badge>
                    </Group>

                    <Text size="sm" c="dimmed" lineClamp={3}>
                      {question.description}
                    </Text>

                    <Group justify="space-between" align="center">
                      <Badge color={getDifficultyColor(question.difficulty)} size="sm">
                        {question.difficulty}
                      </Badge>
                      <Text size="sm" c="blue" fw={500}>
                        {question.points} points
                      </Text>
                    </Group>

                    <Group gap="xs" wrap="wrap">
                      {question.tags?.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" size="xs">
                          {tag}
                        </Badge>
                      ))}
                      {question.tags?.length > 3 && (
                        <Badge variant="outline" size="xs" color="gray">
                          +{question.tags.length - 3}
                        </Badge>
                      )}
                    </Group>

                    {question.attempts > 0 && (
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">
                          Attempts: {question.attempts}
                        </Text>
                        {question.totalPointsEarned > 0 && (
                          <Text size="xs" c="green">
                            Earned: {question.totalPointsEarned} pts
                          </Text>
                        )}
                      </Group>
                    )}

                    <Button variant="light" size="sm" fullWidth>
                      {question.studentStatus === 'solved' ? 'Review' : 
                       question.studentStatus === 'attempted' ? 'Continue' : 'Solve'}
                    </Button>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.total > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                value={pagination.current}
                onChange={handlePageChange}
                total={pagination.total}
              />
            </Group>
          )}
        </>
      ) : (
        <Alert>
          <Text>No questions found matching your criteria.</Text>
          <Button variant="light" mt="sm" onClick={() => setFilters({
            search: '', difficulty: '', status: '', tags: []
          })}>
            Clear Filters
          </Button>
        </Alert>
      )}
    </Container>
  );
}