import React, { useEffect, useState, useRef } from 'react';
import classNames from 'classnames';
import { Todo } from '../types/Todo';

type Props = {
  todo: Todo & { isLoading?: boolean };
  onDelete?: (todoId: number) => Promise<void>;
  onUpdate?: (updatedTodo: Todo) => Promise<void>;
  isAdding?: boolean;
};

export const TodoItem: React.FC<Props> = ({
  todo,
  onDelete,
  onUpdate,
  isAdding = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState(todo.title);
  const editFieldRef = useRef<HTMLInputElement>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (isEditing) {
      editFieldRef.current?.focus();
    }
  }, [isEditing]);

  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }

    if (!isEditing || isSubmittingRef.current) {
      return;
    }

    const trimmedTitle = newTitle.trim();

    if (trimmedTitle === todo.title) {
      setIsEditing(false);

      return;
    }

    isSubmittingRef.current = true;

    if (!trimmedTitle) {
      try {
        await onDelete?.(todo.id);
        setIsEditing(false);
      } catch {
        editFieldRef.current?.focus();
      } finally {
        isSubmittingRef.current = false;
      }

      return;
    }

    try {
      await onUpdate?.({ ...todo, title: trimmedTitle });
      setIsEditing(false);
    } catch {
      editFieldRef.current?.focus();
    } finally {
      isSubmittingRef.current = false;
    }
  };

  const handleKeyUp = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
      setNewTitle(todo.title);
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: todo.completed })}
    >
      <label
        className="todo__status-label"
        htmlFor={`todo-status-${todo.id}`}
        aria-label="Toggle todo status"
      >
        <input
          id={`todo-status-${todo.id}`}
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={() => onUpdate?.({ ...todo, completed: !todo.completed })}
        />
      </label>

      {isEditing ? (
        <form onSubmit={handleSubmit} onBlur={() => handleSubmit()}>
          <input
            data-cy="TodoTitleField"
            type="text"
            className="todo__title-field"
            placeholder="Empty todo will be deleted"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyUp={handleKeyUp}
            ref={editFieldRef}
          />
        </form>
      ) : (
        <>
          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete?.(todo.id)}
          >
            ×
          </button>
        </>
      )}

      <div
        data-cy="TodoLoader"
        className={classNames('modal overlay', {
          'is-active': isAdding,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
