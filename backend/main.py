from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import sqlite3
from datetime import datetime

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database with error handling
def init_db():
    try:
        conn = sqlite3.connect('tasks.db')
        c = conn.cursor()
        c.execute('''
            CREATE TABLE IF NOT EXISTS tasks
            (id INTEGER PRIMARY KEY AUTOINCREMENT,
             title TEXT NOT NULL,
             description TEXT,
             completed BOOLEAN DEFAULT FALSE,
             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
        ''')
        conn.commit()
        conn.close()
        print("Database initialized successfully!")
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise

init_db()

class Task(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False

@app.get("/api/tasks")
async def get_tasks():
    try:
        conn = sqlite3.connect('tasks.db')
        c = conn.cursor()
        c.execute('SELECT * FROM tasks')
        tasks = []
        for row in c.fetchall():
            tasks.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'completed': bool(row[3]),
                'created_at': row[4]
            })
        conn.close()
        return tasks
    except Exception as e:
        print(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/tasks")
async def create_task(task: Task):
    try:
        conn = sqlite3.connect('tasks.db')
        c = conn.cursor()
        c.execute(
            'INSERT INTO tasks (title, description, completed) VALUES (?, ?, ?)',
            (task.title, task.description, task.completed)
        )
        conn.commit()
        task_id = c.lastrowid
        c.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        row = c.fetchone()
        conn.close()
        if row is None:
            raise HTTPException(status_code=404, detail="Task creation failed")
        return {
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'completed': bool(row[3]),
            'created_at': row[4]
        }
    except Exception as e:
        print(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/tasks/{task_id}")
async def update_task(task_id: int, task: Task):
    try:
        conn = sqlite3.connect('tasks.db')
        c = conn.cursor()
        c.execute(
            'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?',
            (task.title, task.description, task.completed, task_id)
        )
        conn.commit()
        c.execute('SELECT * FROM tasks WHERE id = ?', (task_id,))
        row = c.fetchone()
        conn.close()
        if row is None:
            raise HTTPException(status_code=404, detail="Task not found")
        return {
            'id': row[0],
            'title': row[1],
            'description': row[2],
            'completed': bool(row[3]),
            'created_at': row[4]
        }
    except Exception as e:
        print(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    try:
        conn = sqlite3.connect('tasks.db')
        c = conn.cursor()
        c.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
        if c.rowcount == 0:
            conn.close()
            raise HTTPException(status_code=404, detail="Task not found")
        conn.commit()
        conn.close()
        return {"message": "Task deleted successfully"}
    except Exception as e:
        print(f"Error deleting task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)