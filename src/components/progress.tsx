import { Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

export default function ProgressBar({progress, errors, numbers}:{progress:number, errors:any[], numbers:string[]}) {
    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-[999999999] bg-black bg-opacity-30 flex justify-center items-center">
            <div className="flex flex-col items-center justify-center">
                <Loader2 className="w-14 h-14 animate-spin text-primary" />
                <div className="flex items-center gap-2 bg-white">
                    <Progress className="w-80" value={progress/numbers.length*100} />{Math.floor(progress/numbers.length*100)}%
                </div>
                <div className="bg-white">
                    Progress: {progress} out of {numbers.length}
                </div>
                <div className="bg-white">
                    Errors: {errors.length}
                </div>
            </div>
        </div>
    )
}