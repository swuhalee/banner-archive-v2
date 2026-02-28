export const convertToJPEG = async (file: File): Promise<File> => {
    let sourceFile = file;

    // HEIC/HEIF는 브라우저가 네이티브 디코딩을 못하므로 먼저 변환
    // require()를 조건문 안에서 호출해 SSR(window 미정의) 에러 방지
    if (file.type === 'image/heic' || file.type === 'image/heif' || /\.heic$/i.test(file.name) || /\.heif$/i.test(file.name)) {
        const newName = file.name.replace(/\.[^/.]+$/, '.jpg');
        const { heicTo } = await import('heic-to');
        const converted = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 }) as Blob;
        sourceFile = new File([converted], newName, { type: 'image/jpeg' });
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(sourceFile);
        reader.onerror = () => reject(new Error('파일을 읽는 데 실패했습니다.'));
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onerror = () => reject(new Error('허용하는 이미지 형식이 아닙니다.'));
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // 배경을 흰색으로 채우기 (투명도 이슈 방지)
                ctx!.fillStyle = '#FFFFFF';
                ctx!.fillRect(0, 0, canvas.width, canvas.height);
                ctx?.drawImage(img, 0, 0);

                // JPEG로 변환
                canvas.toBlob((blob) => {
                    if (blob) {
                        const jpegFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                            type: "image/jpeg",
                        });
                        resolve(jpegFile);
                    } else {
                        reject(new Error("허용하는 이미지 형식이 아닙니다."));
                    }
                }, "image/jpeg", 0.9);
            };
        };
    });
};
