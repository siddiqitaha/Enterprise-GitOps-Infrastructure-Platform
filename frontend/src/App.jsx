// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    due_date: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error('Error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedTask = {
        ...newTask,
        due_date: newTask.due_date ? newTask.due_date.toISOString() : null,
        priority: newTask.priority.toLowerCase() || 'medium'
      };
      
      console.log('Sending task:', formattedTask);
      
      await axios.post('/api/tasks', formattedTask);
      setNewTask({ title: '', description: '', priority: 'MEDIUM', due_date: null });
      fetchTasks();
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task');
      console.error('Error details:', err.response?.data);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const updatedTask = {
        ...task,
        completed: !task.completed,
      };
      await axios.put(`/api/tasks/${task.id}`, updatedTask);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error.main';
      case 'medium':
        return 'warning.main';
      case 'low':
        return 'success.main';
      default:
        return 'text.primary';
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
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={newTask.priority}
                label="Priority"
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <MenuItem value="LOW">Low</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="HIGH">High</MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              selected={newTask.due_date}
              onChange={(date) => setNewTask({ ...newTask, due_date: date })}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="form-control"
              placeholderText="Select due date and time"
              customInput={<TextField fullWidth />}
            />
            <Button type="submit" variant="contained" color="primary">
              Add Task
            </Button>
          </Stack>
        </form>
      </Paper>

      <List>
        {tasks.map((task) => (
          <ListItem
            key={task.id}
            sx={{
              mb: 1,
              backgroundColor: 'background.paper',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
            }}
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
            primary={
              <Typography
                component="span" // Use <span> instead of <p>
                sx={{
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: getPriorityColor(task.priority),
                }}
              >
                {task.title}
              </Typography>
            }
            secondary={
              <React.Fragment>
                <Typography component="span" variant="body2">
                  {task.description}
                </Typography>
                {task.due_date && (
                  <Typography component="span" variant="caption">
                    Due: {new Date(task.due_date).toLocaleString()}
                  </Typography>
                )}
              </React.Fragment>
            }
          />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

export default App;