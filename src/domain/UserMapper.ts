import { User } from "./User";
import { UserForm } from "./UserForm";

//UserForm → User に変換
export function toUser(userForm: UserForm, id: string, email: string): User {
  return {
    id,
    email,
    name: userForm.name,
    is_vegan: userForm.is_vegan === "true",
    is_gluten_free: userForm.is_gluten_free === "true",
    allergies: userForm.allergies
      ? userForm.allergies
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a.length > 0)
      : [],
    created_at: new Date().toISOString(),
  };
}
