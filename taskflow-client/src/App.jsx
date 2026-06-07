import { useEffect, useState } from "react";
import "./App.css";

function App() {
    const [tasks, setTasks] = useState([]);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("To Do");
    const [dueDate, setDueDate] = useState("");
    const [editingId, setEditingId] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [registerUsername, setRegisterUsername] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [token, setToken] = useState(localStorage.getItem("token"));

    const apiUrl = "http://localhost:5153/api/tasks";
    const authUrl = "http://localhost:5153/api/auth";

    useEffect(() => {
        if (token) {
            loadTasks();
        }
    }, [token]);

    function getAuthHeaders() {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        };
    }

    function register(event) {
        event.preventDefault();

        const userData = {
            username: registerUsername,
            email: registerEmail,
            passwordHash: registerPassword
        };

        fetch(`${authUrl}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(userData)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Register failed");
                }

                alert("Account created. Now login.");
                setRegisterUsername("");
                setRegisterEmail("");
                setRegisterPassword("");
            })
            .catch((error) => console.error(error));
    }

    function login(event) {
        event.preventDefault();

        const loginData = {
            email: loginEmail,
            passwordHash: loginPassword
        };

        fetch(`${authUrl}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }

                return response.json();
            })
            .then((data) => {
                localStorage.setItem("token", data.token);
                setToken(data.token);
                setLoginEmail("");
                setLoginPassword("");
            })
            .catch((error) => console.error(error));
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setTasks([]);
        resetForm();
    }

    function loadTasks() {
        fetch(apiUrl, {
            headers: getAuthHeaders()
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load tasks");
                }

                return response.json();
            })
            .then((data) => setTasks(data))
            .catch((error) => console.error(error));
    }

    function daysLeft(dueDate) {
        if (!dueDate) return null;

        const today = new Date();
        const deadline = new Date(dueDate);

        today.setHours(0, 0, 0, 0);
        deadline.setHours(0, 0, 0, 0);

        return Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    }

    function formatDueDate(dueDate) {
        if (!dueDate) return "No deadline";

        return dueDate.split("T")[0];
    }

    function addTask(event) {
        event.preventDefault();

        const taskData = {
            title: title,
            description: description,
            status: status,
            dueDate: dueDate === "" ? null : dueDate
        };

        if (editingId === null) {
            fetch(apiUrl, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify(taskData)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to add task");
                    }

                    resetForm();
                    loadTasks();
                })
                .catch((error) => console.error(error));
        } else {
            fetch(`${apiUrl}/${editingId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify(taskData)
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to update task");
                    }

                    resetForm();
                    loadTasks();
                })
                .catch((error) => console.error(error));
        }
    }

    function resetForm() {
        setTitle("");
        setDescription("");
        setStatus("To Do");
        setDueDate("");
        setEditingId(null);
    }

    function deleteTask(id) {
        fetch(`${apiUrl}/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to delete task");
                }

                loadTasks();
            })
            .catch((error) => console.error(error));
    }

    function startEdit(task) {
        setEditingId(task.id);
        setTitle(task.title);
        setDescription(task.description);
        setStatus(task.status);
        setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || task.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (!token) {
        return (
            <div className="container">
                <h1>TaskFlow</h1>

                <div className="auth-container">
                    <form onSubmit={register}>
                        <h2>Register</h2>

                        <input
                            placeholder="Username"
                            value={registerUsername}
                            onChange={(e) => setRegisterUsername(e.target.value)}
                        />

                        <input
                            placeholder="Email"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                        />

                        <button type="submit">Register</button>
                    </form>

                    <form onSubmit={login}>
                        <h2>Login</h2>

                        <input
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                        />

                        <button type="submit">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <button onClick={logout}>Logout</button>

            <h1>TaskFlow</h1>

            <input
                className="search-input"
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="filters">
                <button onClick={() => setStatusFilter("All")}>All</button>
                <button onClick={() => setStatusFilter("To Do")}>To Do</button>
                <button onClick={() => setStatusFilter("In Progress")}>In Progress</button>
                <button onClick={() => setStatusFilter("Done")}>Done</button>
            </div>

            <form onSubmit={addTask}>
                <input
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />

                <input
                    placeholder="Task description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                />

                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Done</option>
                </select>

                <button type="submit">
                    {editingId === null ? "Add Task" : "Save Changes"}
                </button>

                {editingId !== null && (
                    <button type="button" onClick={resetForm}>
                        Cancel
                    </button>
                )}
            </form>

            {filteredTasks.map((task) => {
                const remainingDays = daysLeft(task.dueDate);

                return (
                    <div className="task-card" key={task.id}>
                        <h3>{task.title}</h3>
                        <p>{task.description}</p>

                        <span className="status">{task.status}</span>

                        <p>Deadline: {formatDueDate(task.dueDate)}</p>

                        {remainingDays !== null && (
                            <p>
                                {remainingDays > 0
                                    ? `Due in ${remainingDays} days`
                                    : remainingDays === 0
                                        ? "Due today"
                                        : `Overdue by ${Math.abs(remainingDays)} days`}
                            </p>
                        )}

                        <div className="actions">
                            <button onClick={() => startEdit(task)}>✏️ Edit</button>
                            <button onClick={() => deleteTask(task.id)}>🗑 Delete</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default App;