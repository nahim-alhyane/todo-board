"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Todo, Task, Stakeholder, Person, Attachment, AssignedTo } from "@/components/kanban/types";
import { supabase } from "@/lib/supabase/client";
import { X, Plus, Upload, FileText, Trash2, Check } from "lucide-react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface TodoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo?: Todo | null;
  onSuccess?: () => void;
}

interface TaskForm {
  id?: string;
  name: string;
  title: string;
  description: string;
  completed: boolean;
  position: number;
}

interface StakeholderForm {
  id?: string;
  person_id: string;
  notify_by_email: boolean;
}

interface SubtaskForm {
  id?: string;
  title: string;
  completed: boolean;
}

export function TodoFormSheet({ open, onOpenChange, todo, onSuccess }: TodoFormSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<AssignedTo>(null);
  const [tasks, setTasks] = useState<TaskForm[]>([]);
  const [subtasks, setSubtasks] = useState<SubtaskForm[]>([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [stakeholders, setStakeholders] = useState<StakeholderForm[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showNewPersonForm, setShowNewPersonForm] = useState(false);
  const [newPerson, setNewPerson] = useState({
    firstname: "",
    lastname: "",
    email: "",
    language_code: "en",
  });

  useEffect(() => {
    if (open) {
      fetchPersons();
      if (todo) {
        setTitle(todo.title);
        setDescription(todo.description || "");
        setAssignedTo(todo.assigned_to);
        setTasks(
          (todo.tasks || []).map((t) => ({
            id: t.id,
            name: t.name,
            title: t.title,
            description: t.description || "",
            completed: t.completed,
            position: t.position,
          }))
        );
        setStakeholders(
          (todo.stakeholders || []).map((s) => ({
            id: s.id,
            person_id: s.person_id,
            notify_by_email: s.notify_by_email,
          }))
        );
        setAttachments(todo.attachments || []);
        fetchSubtasks(todo.id);
      } else {
        resetForm();
      }
    }
  }, [open, todo]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAssignedTo(null);
    setTasks([]);
    setSubtasks([]);
    setSubtaskInput("");
    setStakeholders([]);
    setAttachments([]);
    setShowNewPersonForm(false);
    setNewPerson({
      firstname: "",
      lastname: "",
      email: "",
      language_code: "en",
    });
  };

  const fetchPersons = async () => {
    const { data, error } = await supabase.from("persons").select("*");
    if (!error && data) {
      setPersons(data);
    }
  };

  const fetchSubtasks = async (todoId: string) => {
    const { data, error } = await supabase
      .from("subtasks")
      .select("*")
      .eq("todo_id", todoId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSubtasks(
        data.map((s) => ({
          id: s.id,
          title: s.title,
          completed: s.completed,
        }))
      );
    }
  };

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        name: "",
        title: "",
        description: "",
        completed: false,
        position: tasks.length,
      },
    ]);
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index: number, field: keyof TaskForm, value: any) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], [field]: value };
    setTasks(updated);
  };

  const addStakeholder = () => {
    if (persons.length > 0) {
      setStakeholders([
        ...stakeholders,
        {
          person_id: persons[0].id,
          notify_by_email: false,
        },
      ]);
    }
  };

  const removeStakeholder = (index: number) => {
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index: number, field: keyof StakeholderForm, value: any) => {
    const updated = [...stakeholders];
    updated[index] = { ...updated[index], [field]: value };
    setStakeholders(updated);
  };

  const handleCreatePerson = async () => {
    if (!newPerson.firstname.trim() || !newPerson.lastname.trim()) {
      alert("Firstname and lastname are required");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("persons")
        .insert({
          firstname: newPerson.firstname,
          lastname: newPerson.lastname,
          email: newPerson.email || null,
          language_code: newPerson.language_code,
        })
        .select()
        .single();

      if (error) throw error;

      setPersons([...persons, data]);
      setNewPerson({
        firstname: "",
        lastname: "",
        email: "",
        language_code: "en",
      });
      setShowNewPersonForm(false);

      // Add the new person as a stakeholder
      setStakeholders([
        ...stakeholders,
        {
          person_id: data.id,
          notify_by_email: false,
        },
      ]);
    } catch (error) {
      console.error("Error creating person:", error);
      alert("Failed to create person");
    }
  };

  const addSubtask = () => {
    if (subtaskInput.trim()) {
      setSubtasks([
        ...subtasks,
        {
          title: subtaskInput.trim(),
          completed: false,
        },
      ]);
      setSubtaskInput("");
    }
  };

  const handleSubtaskKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubtask();
    }
  };

  const toggleSubtask = async (index: number) => {
    const subtask = subtasks[index];
    const newCompleted = !subtask.completed;

    // Update local state
    const updated = [...subtasks];
    updated[index] = { ...updated[index], completed: newCompleted };
    setSubtasks(updated);

    // If subtask has an ID (already saved), update in database
    if (subtask.id && todo) {
      await supabase
        .from("subtasks")
        .update({ completed: newCompleted })
        .eq("id", subtask.id);
    }
  };

  const removeSubtask = async (index: number) => {
    const subtask = subtasks[index];

    // If subtask has an ID (already saved), delete from database
    if (subtask.id && todo) {
      await supabase.from("subtasks").delete().eq("id", subtask.id);
    }

    // Update local state
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !todo) return;

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${todo.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("attachments")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("attachments").insert({
          todo_id: todo.id,
          filename: file.name,
          content_type: file.type,
          size: file.size,
          storage_path: filePath,
        });

        if (dbError) throw dbError;
      }

      // Refresh attachments
      const { data, error } = await supabase
        .from("attachments")
        .select("*")
        .eq("todo_id", todo.id);

      if (!error && data) {
        setAttachments(data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const deleteAttachment = async (attachment: Attachment) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("attachments")
        .remove([attachment.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("attachments")
        .delete()
        .eq("id", attachment.id);

      if (dbError) throw dbError;

      setAttachments(attachments.filter((a) => a.id !== attachment.id));
    } catch (error) {
      console.error("Error deleting attachment:", error);
      alert("Failed to delete attachment");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    setLoading(true);

    try {
      let todoId = todo?.id;

      if (todo) {
        // Update existing todo
        const { error } = await supabase
          .from("todos")
          .update({
            title,
            description,
            assigned_to: assignedTo,
          })
          .eq("id", todo.id);

        if (error) throw error;
      } else {
        // Create new todo
        const { data, error } = await supabase
          .from("todos")
          .insert({
            title,
            description,
            assigned_to: assignedTo,
            status: "BACKLOG",
            position: 0,
          })
          .select()
          .single();

        if (error) throw error;
        todoId = data.id;
      }

      if (!todoId) throw new Error("Failed to get todo ID");

      // Handle tasks
      if (todo) {
        // Delete removed tasks
        const existingTaskIds = tasks.filter((t) => t.id).map((t) => t.id);
        const tasksToDelete = (todo.tasks || [])
          .filter((t) => !existingTaskIds.includes(t.id))
          .map((t) => t.id);

        if (tasksToDelete.length > 0) {
          await supabase.from("tasks").delete().in("id", tasksToDelete);
        }
      }

      // Upsert tasks
      for (const task of tasks) {
        if (task.id) {
          await supabase
            .from("tasks")
            .update({
              name: task.name,
              title: task.title,
              description: task.description,
              completed: task.completed,
              position: task.position,
            })
            .eq("id", task.id);
        } else {
          await supabase.from("tasks").insert({
            todo_id: todoId,
            name: task.name,
            title: task.title,
            description: task.description,
            completed: task.completed,
            position: task.position,
          });
        }
      }

      // Handle stakeholders
      if (todo) {
        // Delete all existing stakeholders and recreate
        await supabase.from("stakeholders").delete().eq("todo_id", todo.id);
      }

      // Insert stakeholders
      if (stakeholders.length > 0) {
        await supabase.from("stakeholders").insert(
          stakeholders.map((s) => ({
            todo_id: todoId,
            person_id: s.person_id,
            notify_by_email: s.notify_by_email,
          }))
        );
      }

      // Handle subtasks
      if (todo) {
        // Delete removed subtasks
        const existingSubtaskIds = subtasks.filter((s) => s.id).map((s) => s.id);
        const existingSubtasks = await supabase
          .from("subtasks")
          .select("id")
          .eq("todo_id", todo.id);

        if (existingSubtasks.data) {
          const subtasksToDelete = existingSubtasks.data
            .filter((s) => !existingSubtaskIds.includes(s.id))
            .map((s) => s.id);

          if (subtasksToDelete.length > 0) {
            await supabase.from("subtasks").delete().in("id", subtasksToDelete);
          }
        }
      }

      // Insert new subtasks (ones without IDs)
      const newSubtasks = subtasks.filter((s) => !s.id);
      if (newSubtasks.length > 0) {
        await supabase.from("subtasks").insert(
          newSubtasks.map((s) => ({
            todo_id: todoId,
            title: s.title,
            completed: s.completed,
          }))
        );
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving todo:", error);
      alert("Failed to save todo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{todo ? "Edit Todo" : "Create Todo"}</SheetTitle>
          <SheetDescription>
            {todo
              ? "Update your todo item details"
              : "Add a new todo item to your board"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <div data-color-mode="light" className="dark:hidden">
              <MDEditor
                value={description}
                onChange={(val) => setDescription(val || "")}
                preview="edit"
                height={200}
              />
            </div>
            <div data-color-mode="dark" className="hidden dark:block">
              <MDEditor
                value={description}
                onChange={(val) => setDescription(val || "")}
                preview="edit"
                height={200}
              />
            </div>
          </div>

          {/* Assigned To */}
          <div className="space-y-2">
            <Label htmlFor="assigned_to">Assigned To</Label>
            <Select
              value={assignedTo || "none"}
              onValueChange={(val) => setAssignedTo(val === "none" ? null : (val as AssignedTo))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="nahim">Nahim</SelectItem>
                <SelectItem value="vanessa">Vanessa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stakeholders */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Stakeholders</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewPersonForm(!showNewPersonForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Person
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addStakeholder}
                  disabled={persons.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Stakeholder
                </Button>
              </div>
            </div>

            {/* New Person Form */}
            {showNewPersonForm && (
              <div className="p-3 border rounded-lg bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-semibold">New Person</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewPersonForm(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="new-firstname" className="text-xs">
                      First Name *
                    </Label>
                    <Input
                      id="new-firstname"
                      value={newPerson.firstname}
                      onChange={(e) =>
                        setNewPerson({ ...newPerson, firstname: e.target.value })
                      }
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new-lastname" className="text-xs">
                      Last Name *
                    </Label>
                    <Input
                      id="new-lastname"
                      value={newPerson.lastname}
                      onChange={(e) =>
                        setNewPerson({ ...newPerson, lastname: e.target.value })
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newPerson.email}
                    onChange={(e) =>
                      setNewPerson({ ...newPerson, email: e.target.value })
                    }
                    placeholder="john.doe@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-language" className="text-xs">
                    Language
                  </Label>
                  <Select
                    value={newPerson.language_code}
                    onValueChange={(val) =>
                      setNewPerson({ ...newPerson, language_code: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCreatePerson}
                  className="w-full"
                >
                  Create Person
                </Button>
              </div>
            )}

            <div className="space-y-2">
              {stakeholders.map((stakeholder, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 border rounded-lg"
                >
                  <Select
                    value={stakeholder.person_id}
                    onValueChange={(val) =>
                      updateStakeholder(index, "person_id", val)
                    }
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {persons.map((person) => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.firstname} {person.lastname}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`notify-${index}`} className="text-xs whitespace-nowrap">
                      Notify
                    </Label>
                    <Switch
                      id={`notify-${index}`}
                      checked={stakeholder.notify_by_email}
                      onCheckedChange={(checked) =>
                        updateStakeholder(index, "notify_by_email", checked)
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeStakeholder(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
            <div className="space-y-3">
              {tasks.map((task, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg space-y-2 bg-card"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateTask(index, "completed", !task.completed)
                        }
                      >
                        {task.completed ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
                        )}
                      </Button>
                      <Input
                        placeholder="Task name"
                        value={task.name}
                        onChange={(e) =>
                          updateTask(index, "name", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTask(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Task title"
                    value={task.title}
                    onChange={(e) =>
                      updateTask(index, "title", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Task description"
                    value={task.description}
                    onChange={(e) =>
                      updateTask(index, "description", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div className="space-y-2">
            <Label>Subtasks</Label>
            <div className="space-y-2">
              <Input
                placeholder="Add a subtask (press Enter)"
                value={subtaskInput}
                onChange={(e) => setSubtaskInput(e.target.value)}
                onKeyDown={handleSubtaskKeyDown}
              />
              <div className="space-y-2">
                {subtasks.map((subtask, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 border rounded-lg bg-card"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSubtask(index)}
                      className="h-5 w-5 p-0"
                    >
                      {subtask.completed ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <div className="h-4 w-4 border-2 border-muted-foreground rounded" />
                      )}
                    </Button>
                    <span
                      className={`flex-1 text-sm ${
                        subtask.completed
                          ? "line-through text-muted-foreground"
                          : ""
                      }`}
                    >
                      {subtask.title}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeSubtask(index)}
                      className="h-5 w-5 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attachments */}
          {todo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Attachments</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Upload"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{attachment.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {(attachment.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteAttachment(attachment)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          {todo && (
            <div className="space-y-1 text-xs text-muted-foreground border-t pt-4">
              <p>Created: {new Date(todo.created_at).toLocaleString()}</p>
              <p>Updated: {new Date(todo.updated_at).toLocaleString()}</p>
            </div>
          )}

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : todo ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
