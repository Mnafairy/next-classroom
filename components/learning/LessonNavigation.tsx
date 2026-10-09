import { Check, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { exercises, modules } from "@/lib/course/lessons";

export default function LessonNavigation({
  active,
  completed,
  onSelect,
  open,
  onClose,
}: {
  active: string;
  completed: string[];
  onSelect: (id: string) => void;
  open: boolean;
  onClose: () => void;
}) {
  const percent = Math.round((completed.length / exercises.length) * 100);
  const current = exercises.find((exercise) => exercise.id === active)!;
  const [expanded, setExpanded] = useState({
    forModule: current.module,
    index: current.module,
  });
  const expandedModule =
    expanded.forModule === current.module ? expanded.index : current.module;
  return (
    <aside
      className={`course-sidebar ${open ? "sidebar-open" : ""}`}
      aria-label="Course navigation"
    >
      <div className="sidebar-intro">
        <h2>Lessons</h2>
        <button
          className="icon-button close-sidebar"
          onClick={onClose}
          aria-label="Close course navigation"
        >
          <X size={18} />
        </button>
      </div>
      <nav aria-label="Course modules">
        {modules.map((module, moduleIndex) => {
          const items = exercises.filter(
            (exercise) => exercise.module === moduleIndex,
          );
          const isActive = current.module === moduleIndex;
          const isExpanded = expandedModule === moduleIndex;
          const done = items.every((exercise) =>
            completed.includes(exercise.id),
          );
          return (
            <div
              className={`nav-module ${isActive ? "module-active" : ""}`}
              key={module.title}
            >
              <button
                className="module-button"
                onClick={() =>
                  setExpanded({
                    forModule: current.module,
                    index: isExpanded ? -1 : moduleIndex,
                  })
                }
                aria-expanded={isExpanded}
                aria-controls={`module-${moduleIndex}-lessons`}
              >
                <span
                  className="module-index"
                  aria-label={`Module ${moduleIndex + 1}`}
                >
                  {done ? (
                    <Check size={15} />
                  ) : (
                    String(moduleIndex + 1).padStart(2, "0")
                  )}
                </span>
                <strong>{module.title}</strong>
                <ChevronDown
                  size={15}
                  className={isExpanded ? "" : "collapsed-chevron"}
                />
              </button>
              <div
                className="nav-exercises"
                id={`module-${moduleIndex}-lessons`}
                hidden={!isExpanded}
              >
                {items.map((exercise, index) => (
                  <button
                    key={exercise.id}
                    onClick={() => onSelect(exercise.id)}
                    className={`nav-exercise ${active === exercise.id ? "selected" : ""}`}
                    aria-current={active === exercise.id ? "step" : undefined}
                  >
                    <span
                      className={
                        completed.includes(exercise.id)
                          ? "exercise-marker marker-complete"
                          : "exercise-marker"
                      }
                    >
                      {completed.includes(exercise.id) ? (
                        <Check size={12} />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span>{exercise.shortTitle}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-bottom">
        <p className="progress-caption">
          {completed.length} of {exercises.length} complete
        </p>
        <div
          className="progress-track"
          role="progressbar"
          aria-label="Course completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
      </div>
    </aside>
  );
}
