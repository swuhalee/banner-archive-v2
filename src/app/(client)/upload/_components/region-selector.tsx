import { getEupmyeondongList, getRiList, getSidoList, getSigunguList } from '@/src/utils/region/korea-regions';
import { useEffect, useState } from 'react'

type RegionSelectorProps = {
    value: string;
    onChange: (regionText: string) => void;
};

const RegionSelector = ({ value, onChange }: RegionSelectorProps) => {
    const [sido, setSido] = useState("");
    const [sigungu, setSigungu] = useState("");
    const [eupmyeondong, setEupmyeondong] = useState("");
    const [ri, setRi] = useState("");

    // 외부에서 value가 "" 으로 초기화되면 (handleReset) 내부 state도 초기화
    useEffect(() => {
        if (!value) {
            // 외부 value 초기화 시 내부 선택 상태를 동기화해야 하므로 예외적으로 상태를 리셋한다.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSido("");
            setSigungu("");
            setEupmyeondong("");
            setRi("");
        }
    }, [value]);

    // 세종특별자치시는 시군구 단계 없이 바로 읍면동 단계로 진입
    const isSejong = sido === "세종특별자치시";

    const sigunguList = sido && !isSejong ? getSigunguList(sido) : [];
    // 세종: JSON의 시군구 키에 읍면동 데이터가 저장되어 있음
    const eupmyeondongList = isSejong
        ? (sido ? getSigunguList(sido) : [])
        : (sido && sigungu ? getEupmyeondongList(sido, sigungu) : []);
    // 세종: JSON의 읍면동 키에 리 데이터가 저장되어 있음 (sigungu 자리에 eupmyeondong 사용)
    const riList = isSejong
        ? (sido && eupmyeondong ? getEupmyeondongList(sido, eupmyeondong) : [])
        : (sido && sigungu && eupmyeondong ? getRiList(sido, sigungu, eupmyeondong) : []);

    function handleSidoChange(next: string) {
        setSido(next);
        setSigungu("");
        setEupmyeondong("");
        setRi("");
        onChange(next);
    }

    function handleSigunguChange(next: string) {
        setSigungu(next);
        setEupmyeondong("");
        setRi("");
        onChange(next ? `${sido} ${next}` : sido);
    }

    function handleEupmyeondongChange(next: string) {
        setEupmyeondong(next);
        setRi("");
        if (isSejong) {
            onChange(next ? `${sido} ${next}` : sido);
        } else {
            onChange(next ? `${sido} ${sigungu} ${next}` : `${sido} ${sigungu}`);
        }
    }

    function handleRiChange(next: string) {
        setRi(next);
        if (isSejong) {
            onChange(next ? `${sido} ${eupmyeondong} ${next}` : `${sido} ${eupmyeondong}`);
        } else {
            onChange(next ? `${sido} ${sigungu} ${eupmyeondong} ${next}` : `${sido} ${sigungu} ${eupmyeondong}`);
        }
    }

    return (
        <div className="grid gap-2">
            <select value={sido} onChange={(e) => handleSidoChange(e.target.value)}>
                <option value="">시 / 도 선택</option>
                {getSidoList().map((s) => (
                    <option key={s} value={s}>{s}</option>
                ))}
            </select>

            {sido && !isSejong && (
                <select value={sigungu} onChange={(e) => handleSigunguChange(e.target.value)}>
                    <option value="">시 / 군 / 구 선택</option>
                    {sigunguList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )}

            {(isSejong ? sido : sigungu) && (
                <select value={eupmyeondong} onChange={(e) => handleEupmyeondongChange(e.target.value)}>
                    <option value="">읍 / 면 / 동 선택</option>
                    {eupmyeondongList.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            )}

            {riList.length > 0 && (
                <select value={ri} onChange={(e) => handleRiChange(e.target.value)}>
                    <option value="">리 선택</option>
                    {riList.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            )}
        </div>
    )
}

export default RegionSelector
