import { Label } from "@radix-ui/react-label"
import { Control, Controller, Path, } from "react-hook-form"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { UserProfileFields } from "@/domain/UserProfileFields"


type UserProfileRadioFieldProps<T extends UserProfileFields> = {
    fieldLabel: string,
    name: Path<T>;             // ← フィールド名
    control: Control<T>;       // ← Register なら UserForm, Search なら SearchForm
    idPrefix: string,

}

export const UserProfileRadioField = <T extends UserProfileFields>({
    fieldLabel, name, control, idPrefix }: UserProfileRadioFieldProps<T>) => {


    return (
        <>
            <div className="space-y-2">
                <Label className="text-base font-semibold text-green-700">{fieldLabel}</Label>
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <RadioGroup
                            value={field.value ? "true" : "false"}               // boolean → string
                            onValueChange={(val) => field.onChange(val === "true")} // string → boolean
                            className="flex flex-row gap-6"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="true" id={`${idPrefix}_true`} data-testid={`${idPrefix}Yes`} />
                                <Label htmlFor={`${idPrefix}_true`} className="font-normal">はい</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="false" id={`${idPrefix}_false`} data-testid={`${idPrefix}No`} />
                                <Label htmlFor={`${idPrefix}_false`} className="font-normal">いいえ</Label>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>
        </>
    )
}