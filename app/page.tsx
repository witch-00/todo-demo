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

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-6">
        <header className="mb-4">
          <h1 className="text-2xl font-semibold text-blue-700">我的待办清单</h1>
        </header>

        <form className="flex gap-2" onSubmit={addTask}>
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 rounded-md border border-blue-200 px-3 py-2 text-sm placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="输入新的任务..."
            aria-label="任务内容"
          />
          <button
            type="submit"
            onClick={(e) => addTask(e)}
            className="ml-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
            <ul className="divide-y divide-blue-100 rounded-md overflow-hidden border border-blue-50">
              {tasks.map((task) => (
                <li key={task.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center">
                    <input
                      id={`chk-${task.id}`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleCompleted(task.id, !task.completed)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-400"
                    />
                    <label htmlFor={`chk-${task.id}`} className={`ml-3 text-sm ${task.completed ? "line-through text-blue-300" : "text-blue-900"}`}>
                      {task.text}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
