import { useState } from "react";
import { Input } from "./ui/input";

export default function Range({ value, onChange, minv, maxv }: { value: string, onChange: (value: string) => void , minv?: number, maxv?: number}) {
    const [min, setMin] = useState(value ? JSON.parse(value)[0] : undefined);
    const [max, setMax] = useState(value ? JSON.parse(value)[1] : undefined);

    return (
        <div className="flex gap-1">
            <Input type="number"
                min={minv}
                max={maxv}
                placeholder={minv?.toString()}
                value={min} onChange={(e) => {
                    setMin(e.target.value);
                    onChange(JSON.stringify([Number(e.target.value), Number(max)]));
                }} className="w-20" />
            <Input type="number" value={max}
                min={minv}
                max={maxv}
                placeholder={maxv?.toString()}
                onChange={
                    (e) => {
                        setMax(e.target.value);
                        onChange(JSON.stringify([Number(min), Number(e.target.value)]));
                    }
                } className="w-20" />
        </div>
    )
}