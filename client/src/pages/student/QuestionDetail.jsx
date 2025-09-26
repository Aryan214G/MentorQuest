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
  Button,
  Select,
  Alert,
  Tabs,
  Code,
  Paper,
  Divider,
  ActionIcon
} from '@mantine/core';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { notifications } from '@mantine/notifications';
import Editor from '@monaco-editor/react';
import axios from 'axios';

export default function QuestionDetail() {
  const { questionId } = useParams();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
  ];

  const defaultCode = {
    javascript: `// Write your solution here
function solve() {
    // Your code here
}`,
    python: `# Write your solution here
def solve():
    # Your code here
    pass`,
    java: `// Write your solution here
public class Solution {
    public void solve() {
        // Your code here
    }
}`,
    cpp: `// Write your solution here
#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`
  };

  useEffect(() => {
    fetchQuestionData();
  }, [questionId]);

  useEffect(() => {
    if (!code) {
      setCode(defaultCode[language]);
    }
  }, [language]);

  const fetchQuestionData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/user/questions/${questionId}`);
      setQuestionData(response.data);
      
      // Set initial code if there's a previous submission
      if (response.data.progress?.bestSubmission?.code) {
        setCode(response.data.progress.bestSubmission.code);
        setLanguage(response.data.progress.bestSubmission.language);
      } else {
        setCode(defaultCode[language]);
      }
    } catch (error) {
      console.error('Failed to fetch question:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load question',
        color: 'red'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      notifications.show({
        title: 'Error',
        message: 'Please write some code before submitting',
        color: 'red'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`/user/questions/${questionId}/submit`, {
        code: code.trim(),
        language
      });

      notifications.show({
        title: 'Success',
        message: response.data.message,
        color: response.data.submission.status === 'solved' ? 'green' : 'orange'
      });

      // Refresh question data to update progress
      await fetchQuestionData();
    } catch (error) {
      console.error('Failed to submit solution:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to submit solution',
        color: 'red'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRunCode = () => {
    // For now, just show a placeholder notification
    notifications.show({
      title: 'Code Runner',
      message: 'Code execution feature would be implemented here',
      color: 'blue'
    });
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <Container>Loading...</Container>;
  }

  if (!questionData) {
    return (
      <Container>
        <Alert color="red">
          <Text>Question not found</Text>
          <Button variant="light" mt="sm" onClick={() => navigate('/student/questions')}>
            Back to Questions
          </Button>
        </Alert>
      </Container>
    );
  }

  const { question, progress, submissions } = questionData;

  return (
    <Container size="xl" p={{ base: 'xs', sm: 'md' }} style={{ textAlign: 'center' }}>
      {/* Header */}
      <Stack gap="md" mb={{ base: 'lg', sm: 'xl' }} align="center">
        {/* Mobile Navigation */}
        <Group justify="center" hiddenFrom="md" gap="md">
          <Button 
            variant="subtle" 
            size="sm"
            onClick={() => navigate('/student/questions')}
          >
            ← Back
          </Button>
          <Button 
            variant="filled" 
            color="red" 
            size="sm"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Group>

        {/* Desktop Header */}
        <Group justify="space-between" visibleFrom="md">
          <Group>
            <Button variant="subtle" onClick={() => navigate('/student/questions')}>
              ← Back to Questions
            </Button>
            <div>
              <Title order={2}>{question.title}</Title>
              <Group gap="xs" mt="xs">
                <Badge color={getDifficultyColor(question.difficulty)}>
                  {question.difficulty}
                </Badge>
                <Badge color="blue">{question.points} points</Badge>
                {progress?.status && (
                  <Badge color={progress.status === 'solved' ? 'green' : 'orange'}>
                    {progress.status.replace('_', ' ')}
                  </Badge>
                )}
              </Group>
            </div>
          </Group>
          
          <Group>
            <Button variant="outline" onClick={() => navigate('/student/dashboard')}>
              Dashboard
            </Button>
            <Button variant="filled" color="red" onClick={handleLogout}>
              Logout
            </Button>
          </Group>
        </Group>

        {/* Mobile Title Section */}
        <Card shadow="sm" padding="md" radius="md" withBorder hiddenFrom="md">
          <Stack gap="xs">
            <Title order={3} size="h4">{question.title}</Title>
            <Group gap="xs" wrap="wrap">
              <Badge color={getDifficultyColor(question.difficulty)} size="sm">
                {question.difficulty}
              </Badge>
              <Badge color="blue" size="sm">{question.points} points</Badge>
              {progress?.status && (
                <Badge color={progress.status === 'solved' ? 'green' : 'orange'} size="sm">
                  {progress.status.replace('_', ' ')}
                </Badge>
              )}
            </Group>
          </Stack>
        </Card>
      </Stack>

      <Grid gutter={{ base: 'sm', sm: 'md' }}>
        {/* Question Description */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="sm" padding={{ base: 'md', sm: 'lg' }} radius="md" withBorder>
            <Stack gap={{ base: 'sm', sm: 'md' }}>
              <Title order={3} size="h3">Problem Statement</Title>
              <Text style={{ whiteSpace: 'pre-wrap' }} size="md">
                {question.description}
              </Text>

              {question.constraints && (
                <>
                  <Title order={4} size="h4">Constraints</Title>
                  <Text style={{ whiteSpace: 'pre-wrap' }} size="sm" c="dimmed">
                    {question.constraints}
                  </Text>
                </>
              )}

              {question.examples?.length > 0 && (
                <>
                  <Title order={4} size="h4">Examples</Title>
                  {question.examples.map((example, index) => (
                    <Paper key={index} p={{ base: 'xs', sm: 'sm' }} withBorder>
                      <Text fw={500} size="sm">Example {index + 1}:</Text>
                      <Code block mt="xs" style={{ fontSize: '12px' }}>
                        Input: {example.input}
                      </Code>
                      <Code block mt="xs" style={{ fontSize: '12px' }}>
                        Output: {example.output}
                      </Code>
                      {example.explanation && (
                        <Text size="sm" c="dimmed" mt="xs">
                          Explanation: {example.explanation}
                        </Text>
                      )}
                    </Paper>
                  ))}
                </>
              )}

              <Title order={4}>Topics</Title>
              <Group gap="xs">
                {question.tags?.map(tag => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </Group>

              {progress && (
                <>
                  <Divider />
                  <Title order={4}>Your Progress</Title>
                  <Group>
                    <Text size="sm">Attempts: <strong>{progress.attempts}</strong></Text>
                    <Text size="sm">Status: <strong>{progress.status.replace('_', ' ')}</strong></Text>
                    {progress.totalPointsEarned > 0 && (
                      <Text size="sm" c="green">
                        Points Earned: <strong>{progress.totalPointsEarned}</strong>
                      </Text>
                    )}
                  </Group>
                </>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        {/* Code Editor */}
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card shadow="sm" padding={{ base: 'md', sm: 'lg' }} radius="md" withBorder>
            <Stack gap={{ base: 'sm', sm: 'md' }}>
              <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Title order={3} size="h3">Code Editor</Title>
                <Select
                  value={language}
                  onChange={setLanguage}
                  data={languages}
                  size="sm"
                  style={{ width: '100px', minWidth: '100px' }}
                />
              </Group>

              <div style={{ 
                height: '350px', 
                border: '1px solid #e0e0e0', 
                borderRadius: '8px',
                minHeight: '250px'
              }}>
                <Editor
                  height="100%"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: 'on',
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    renderLineHighlight: 'none'
                  }}
                />
              </div>

              <Group gap="xs">
                <Button
                  variant="outline"
                  onClick={handleRunCode}
                  size="sm"
                  style={{ flex: 1 }}
                >
                  Run Code
                </Button>
                <Button
                  onClick={handleSubmit}
                  loading={submitting}
                  size="sm"
                  style={{ flex: 1 }}
                >
                  Submit Solution
                </Button>
              </Group>
            </Stack>
          </Card>

          {/* Submissions History */}
          {submissions?.length > 0 && (
            <Card shadow="sm" padding="lg" radius="md" withBorder mt="md">
              <Title order={4} mb="md">Previous Submissions</Title>
              <Stack gap="xs">
                {submissions.slice(0, 5).map((submission, index) => (
                  <Paper key={index} p="sm" withBorder>
                    <Group justify="space-between">
                      <Group>
                        <Badge color={submission.status === 'solved' ? 'green' : 'orange'}>
                          {submission.status}
                        </Badge>
                        <Badge variant="outline">{submission.language}</Badge>
                        {submission.pointsEarned > 0 && (
                          <Text size="sm" c="green">+{submission.pointsEarned} pts</Text>
                        )}
                      </Group>
                      <Text size="xs" c="dimmed">
                        {new Date(submission.submissionTime).toLocaleString()}
                      </Text>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            </Card>
          )}
        </Grid.Col>
      </Grid>
    </Container>
  );
}