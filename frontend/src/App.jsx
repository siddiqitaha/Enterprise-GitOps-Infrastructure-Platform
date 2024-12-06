import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  IconButton,
  Typography,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
        const response = await axios.get('/api/tasks', {
            headers: {
                'Accept': 'application/json'
            }
        });
        console.log('Response:', response.data);  // Add this for debugging
        setTasks(response.data);
    } catch (err) {
        console.log('Error details:', err.response);  // Add this for debugging
        setError(err.response?.data?.detail || 'Failed to fetch tasks');
    }
};

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      setNewTask({ title: '', description: '' });
      fetchTasks();
      setError(null);
    } catch (err) {
      setError('Failed to create task');
      console.error('Error:', err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`/api/tasks/${task.id}`, {
        ...task,
        completed: !task.completed,
      });
      fetchTasks();
      setError(null);
    } catch (err) {
      setError('Failed to update task');
      console.error('Error:', err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
      setError(null);
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error:', err);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Task Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Task Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            margin="normal"
            multiline
            rows={2}
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
            Add Task
          </Button>
        </form>
      </Paper>

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            secondaryAction={
              <>
                <IconButton
                  edge="end"
                  onClick={() => toggleComplete(task)}
                  color={task.completed ? "success" : "default"}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => deleteTask(task.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={task.title}
              secondary={task.description}
              sx={{
                textDecoration: task.completed ? 'line-through' : 'none',
              }}
            />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default App;