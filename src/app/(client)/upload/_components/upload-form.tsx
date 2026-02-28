'use client';

import { SubjectType, SUBJECT_TYPE_LABEL } from '@/src/type/banner';
import { convertToJPEG } from '@/src/utils/image/imageConverter';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import RegionSelector from './region-selector';

export type FormValues = {
    imageFile: File | null;
    regionText: string;
    observedAt: string;
    subjectType: SubjectType | "";
    confirmed1: boolean;
    confirmed2: boolean;
};

type UploadFormProps = {
    onSubmit: (data: FormValues) => void;
};

const UploadForm = ({ onSubmit }: UploadFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { register, control, setValue, watch, handleSubmit, formState: { isValid } } = useForm<FormValues>({
        mode: "onChange",
        defaultValues: {
            imageFile: null,
            regionText: "",
            observedAt: new Date().toISOString().split('T')[0],
            subjectType: "",
            confirmed1: false,
            confirmed2: false,
        },
    });

    const imageFile = watch("imageFile");

    async function onFileSelect(file: File) {
        const image = await convertToJPEG(file);
        setValue("imageFile", image, { shouldValidate: true });
        setPreviewUrl(URL.createObjectURL(image));
    }

    function onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) onFileSelect(file);
    }

    return (
        <div className="grid grid-cols-2 gap-4 max-[1024px]:grid-cols-1">
            {/* 이미지 업로드 영역 */}
            <article className="rounded-2xl border border-(--line) bg-(--surface) p-4">
                <div
                    className="mt-2 grid min-h-60 place-items-center rounded-xl border border-dashed border-(--line-strong) bg-(--surface-alt) text-(--text-muted) cursor-pointer overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={previewUrl} alt="미리보기" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-[13px]">드래그 앤 드롭 또는 파일 선택</span>
                    )}
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); }}
                />
                <p className="mt-2 text-[13px] text-(--text-muted)">GIF 제외 이미지</p>
            </article>

            {/* 정보 입력 폼 */}
            <form
                className="grid gap-3 bg-(--surface) p-4"
                aria-label="업로드 폼"
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className="grid gap-1.5 text-[13px] font-semibold text-(--text-muted)">
                    위치
                    <Controller
                        name="regionText"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <RegionSelector value={field.value} onChange={field.onChange} />
                        )}
                    />
                </div>

                <label className="grid gap-1.5 text-[13px] font-semibold text-(--text-muted)">
                    관측일
                    <input
                        type="date"
                        {...register("observedAt", { required: true })}
                    />
                </label>

                <label className="grid gap-1.5 text-[13px] font-semibold text-(--text-muted)">
                    주체 유형
                    <select {...register("subjectType", { required: true })}>
                        <option value="" disabled>선택하세요</option>
                        {Object.entries(SUBJECT_TYPE_LABEL).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </label>

                <label className="pt-2 flex items-center gap-1.5 text-[13px] leading-none text-(--text-muted)">
                    <input
                        type="checkbox"
                        className="m-0 h-3.5 w-3.5"
                        {...register("confirmed1", { validate: (v) => v === true })}
                    />
                    사진을 촬영한 실제 위치와 날짜 정보가 정확합니다.
                </label>

                <label className="pb-4 flex items-center gap-1.5 text-[13px] leading-none text-(--text-muted)">
                    <input
                        type="checkbox"
                        className="m-0 h-3.5 w-3.5"
                        {...register("confirmed2", { validate: (v) => v === true })}
                    />
                    직접 촬영한 사진이며, 본 아카이브 서비스의 기록 목적으로 활용됨에 동의합니다.
                </label>

                <button type="submit" className="btn btn-solid" disabled={!isValid || !imageFile}>
                    확인
                </button>
            </form>
        </div>
    )
}

export default UploadForm
