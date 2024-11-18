"use client";

import { useState, useEffect } from "react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import {Nullable} from "@aws-amplify/data-schema";

Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const { user, signOut } = useAuthenticator();

  // State for groups and todos
  const [groups, setGroups] = useState<
    Array<{
      readonly id: string;
      name: Nullable<string>;
      owner: string | null;
      readonly createdAt: string;
      readonly updatedAt: string;
    }>
  >([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [todos, setTodos] = useState<
    Array<{
      content?: string | null;
      readonly id: string;
      owner?: string | null;
      readonly createdAt: string;
      readonly updatedAt: string;
    }>
  >([]);

  // Fetch groups using observeQuery
  useEffect(() => {
    const subscription = client.models.Group.observeQuery().subscribe({
      next: (data) => {
        setGroups([...data.items]);
      },
    });

    return () => subscription.unsubscribe(); // Clean up subscription on unmount
  }, []);

  // Fetch todos based on the selected group
  function fetchGroupTodos(groupId: string) {
    client.models.Todo.observeQuery({
      filter: {
        group: { eq: groupId },
      },
    }).subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }

  // Create a new group
  async function createGroup() {
    const groupName = window.prompt("Group name");
    if (groupName) {
      await client.models.Group.create({ name: groupName });
    }
  }

  // Create a new todo
  async function createTodo() {
    if (!selectedGroup) {
      alert("Please select a group first!");
      return;
    }

    const content = window.prompt("Todo content");
    if (content) {
      await client.models.Todo.create({
        content,
        group: selectedGroup,
      });
    }
  }

  // Delete a todo
  async function deleteTodo(id: string) {
    await client.models.Todo.delete({ id });
  }

  // Select a group and fetch its todos
  function selectGroup(groupId: string) {
    setSelectedGroup(groupId);
    fetchGroupTodos(groupId);
  }

  // // Fetch todos when the selected group changes
  // useEffect(() => {
  //   if (selectedGroup) {
  //     fetchGroupTodos(selectedGroup);
  //   }
  // }, [selectedGroup]);

  return (
    <main>
      <div className="sidebar">
        <h3>{user?.signInDetails?.loginId}'s Groups</h3>
        <button onClick={createGroup}>+ New Group</button>
        <ul>
          {groups.map((group) => (
            <li
              key={group.id}
              onClick={() => selectGroup(group.id)}
              style={{
                backgroundColor: group.id === selectedGroup ? "#dadbf9" : "white",
              }}
            >
              {group.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="main-content">
      {selectedGroup ? (
          <>
            <h1>
              Todos for{" "}
              {groups.find((g) => g.id === selectedGroup)?.name || "Unknown Group"}
            </h1>
            <button onClick={createTodo}>+ New Todo</button>
            { !todos?.length ?
              <div style={{margin: '20px 0', color: 'gray'}}>No todos in this group yet</div> :
              <ul>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  onClick={() => deleteTodo(todo.id)}
                >
                  {todo.content}
                </li>
              ))}
            </ul> }
          </>
        ) : (
          <h1>Please select a group to view todos</h1>
        )}
      </div>

      <div className="footer">
        {/*🥳 App successfully hosted. Try creating a new todo or group.*/}
        {/*<br />*/}
        {/*<a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">*/}
        {/*  Review next steps of this tutorial.*/}
        {/*</a>*/}
        <hr/>
        <button onClick={signOut}>Sign out</button>
      </div>
    </main>
  );
}
