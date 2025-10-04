import { SearchForm } from "./SearchForm";
import { User } from "./User";
import { UserForm } from "./UserForm";

//UserForm → User に変換
export function toUser(
  form: UserForm | SearchForm,
  id: string,
  email: string
): User {
  return {
    id,
    email,
    // SearchForm からきた場合 undefined
    name: "name" in form ? form.name : undefined,
    is_vegan: form.is_vegan,
    is_gluten_free: form.is_gluten_free,
    allergies: form.allergies
      ? form.allergies.split(",").map((allergy) => allergy.trim())
      : [],
    created_at: new Date().toISOString(),
  };
}
