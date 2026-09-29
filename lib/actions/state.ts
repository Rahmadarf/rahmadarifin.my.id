// Shared shape for every Server Action used with useActionState. Kept in its
// own module (no "use server") so Client Components can import the type and the
// initial value without pulling the actions themselves into the bundle.

export type ActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string>;
  // Set after a successful create so the form can reset itself.
  resetKey?: string;
};

export const initialActionState: ActionState = { status: "idle" };

export function actionError(
  message: string,
  errors?: Record<string, string>,
): ActionState {
  return { status: "error", message, errors };
}

export function actionSuccess(message: string): ActionState {
  return { status: "success", message, resetKey: Date.now().toString(36) };
}
