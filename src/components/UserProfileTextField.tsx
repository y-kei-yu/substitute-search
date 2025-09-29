import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { UseFormRegister, FieldValues, Path } from "react-hook-form"

type UserProfileTextFieldProps<T extends FieldValues> = {
    fieldLabel: string;
    name: Path<T>;                       // ← "allergies" を受け取れるようにする
    register: UseFormRegister<T>;
}

export const UserProfileTextField = <T extends FieldValues>({
    fieldLabel,
    name,
    register,
}: UserProfileTextFieldProps<T>) => {
    return (
        <div className="space-y-2">
            <Label htmlFor={name} className="text-base font-semibold text-green-700">{fieldLabel}</Label>
            <Input
                id={name}
                {...register(name)}
                placeholder="例: 卵, 乳, 小麦"
                className="placeholder:text-slate-400"
            />
        </div>
    )
}