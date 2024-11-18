"use client";

import { useState, useEffect } from "react";
import { useAuthenticator } from '@aws-amplify/ui-react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator();

  // State for groups and todos
  const [groups, setGroups] = useState<Array<string>>(["Group 1", "Group 2"]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [todos, setTodos] = useState<Array<{
    content?: string | null;
    readonly id: string;
    owner?: string | null;
    readonly createdAt: string;
    readonly updatedAt: string;
  }>>([]);

  // Fetch todos based on the selected group
  function fetchGroupTodos(groupName: string) {
    client.models.Todo.observeQuery({
      filter: {
        group: { eq: groupName },
      },
    }).subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  // Create a new todo
  function createTodo() {
    if (!selectedGroup) {
      alert("Please select a group first!");
      return;
    }

    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({
        content,
        group: selectedGroup,
      });
    }
  }

  // Delete a todo
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  // Add a new group
  function createGroup() {
    const groupName = window.prompt("Group name");
    if (groupName && !groups.includes(groupName)) {
      setGroups([...groups, groupName]);
    }
  }

  // Select a group and fetch its todos
  function selectGroup(groupName: string) {
    setSelectedGroup(groupName);
    // fetchGroupTodos(groupName);
  }

  // Fetch todos when the selected group changes
  useEffect(() => {
    if (selectedGroup) {
      fetchGroupTodos(selectedGroup);
    }
  }, [selectedGroup]);

  return (
    <main>
      <div className="sidebar">
        <h3>{user?.signInDetails?.loginId}'s Groups</h3>
        <button onClick={createGroup}>+ New Group</button>
        <ul>
          {groups.map((group) => (
            <li
              key={group}
              onClick={() => selectGroup(group)}
              style={{
                backgroundColor: group === selectedGroup ? "#dadbf9" : "white",
              }}
            >
              {group}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
        {selectedGroup ? (
          <>
            <h1>{selectedGroup}'s Todos</h1>
            <button onClick={createTodo}>+ New Todo</button>
            <ul>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  onClick={() => deleteTodo(todo.id)}
                >
                  {todo.content}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <h1>Please select a group to view todos</h1>
        )}
      </div>

      <div className="footer">
        🥳 App successfully hosted. Try creating a new todo or group.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
        <button onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}
