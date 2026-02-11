"use client";

import React, { useEffect, useRef, useState } from "react";

type Task = {
  id: number;
  text: string;
  completed: boolean;
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchTodos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data.map((t: any) => ({ id: t.id, text: t.content, completed: t.completed })) : []);
    } catch (err) {
      console.error(err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTask = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = text.trim();
    if (!content) return;
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Create failed");
      setText("");
      inputRef.current?.focus();
      await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCompleted = async (id: number, completed: boolean) => {
    try {
      const res = await fetch("/api/todos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
      });
      if (!res.ok) throw new Error("Update failed");
      await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      const res = await fetch("/api/todos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      await fetchTodos();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-md p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-slate-900">我的待办清单</h1>
        </header>

        <form className="flex gap-2" onSubmit={addTask}>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="输入新的任务..."
            aria-label="任务内容"
          />
          <button
            type="submit"
            onClick={(e) => addTask(e)}
            className="ml-1 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-colors duration-200 px-4 py-2 text-sm font-medium text-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            添加
          </button>
        </form>

        <section className="mt-6">
          {loading ? (
            <p className="text-center text-sm text-blue-600/70">加载中...</p>
          ) : tasks.length === 0 ? (
            <p className="text-center text-sm text-blue-600/70">暂无任务，添加一个开始吧。</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li key={task.id} className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <input
                      id={`chk-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(task.id, !task.completed)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-300"
                    />
                    <label htmlFor={`chk-${task.id}`} className={`ml-3 text-sm ${task.completed ? "line-through text-slate-400" : "text-slate-900"}`}>
                      {task.text}
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label="删除任务"
                    className="ml-4 text-red-500 hover:text-red-600 p-1 rounded"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
