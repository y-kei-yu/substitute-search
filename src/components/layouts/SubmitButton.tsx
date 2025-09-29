import { Button } from "../ui/button"

type SubmitButtonProps = {
    buttonName: string
}

export const SubmitButton = ({ buttonName }: SubmitButtonProps) => {
    return (
        <div className="flex justify-center pt-4">
            <Button type="submit" size="lg" className="mt-6  flex items-center justify-center gap-3 rounded-lg bg-green-600 px-6 py-3 text-lg font-semibold text-white shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-200 transition">
                {buttonName}
            </Button>
        </div>
    )
}
