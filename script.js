class SubtitleGenerator {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.backgroundSlice = null;
        this.zoomLevel = 1;
        this.minZoom = 0.1;
        this.maxZoom = 3;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // 原有的事件监听器
        document.getElementById('imageInput').addEventListener('change', this.handleImageUpload.bind(this));
        document.getElementById('generateBtn').addEventListener('click', this.generateSubtitle.bind(this));
        document.getElementById('saveBtn').addEventListener('click', this.saveImage.bind(this));
document.getElementById('shareBtn').addEventListener('click', this.shareImage.bind(this));
        
        // 新增：上传区域点击事件
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        // 新增：拖拽上传功能
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type.startsWith('image/')) {
                this.handleImageFile(files[0]);
            }
        });
        
        // 新增：更换文件按钮事件
        document.getElementById('changeFileBtn').addEventListener('click', () => {
            imageInput.click();
        });
        
        // 新增：缩放控制事件
        this.initZoomControls();
        
        // 新增：滑块值实时更新
        this.initSliderUpdates();
    }
    
    initZoomControls() {
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const zoomLevelSpan = document.getElementById('zoomLevel');
        const previewWrapper = document.getElementById('previewWrapper');
        
        zoomInBtn.addEventListener('click', () => {
            this.zoomLevel = Math.min(this.maxZoom, this.zoomLevel + 0.1);
            this.updateZoom();
        });
        
        zoomOutBtn.addEventListener('click', () => {
            this.zoomLevel = Math.max(this.minZoom, this.zoomLevel - 0.1);
            this.updateZoom();
        });
        
        // 鼠标滚轮缩放
        previewWrapper.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + delta));
            this.updateZoom();
        });
    }
    
    updateZoom() {
        const zoomLevelSpan = document.getElementById('zoomLevel');
        const preview = document.getElementById('preview');
        const canvas = document.getElementById('canvas');
        
        // 更新显示的缩放比例
        zoomLevelSpan.textContent = Math.round(this.zoomLevel * 100) + '%';
        
        // 应用缩放变换
        const transform = `scale(${this.zoomLevel})`;
        if (preview.style.display !== 'none') {
            preview.style.transform = transform;
            preview.style.transformOrigin = 'center';
        }
        if (canvas.style.display !== 'none') {
            canvas.style.transform = transform;
            canvas.style.transformOrigin = 'center';
        }
    }
    
    initSliderUpdates() {
        // 字幕高度滑块
        const heightSlider = document.getElementById('subtitleHeight');
        const heightValue = document.getElementById('heightValue');
        heightSlider.addEventListener('input', () => {
            heightValue.textContent = heightSlider.value + 'px';
        });
        
        // 字体大小滑块
        const fontSizeSlider = document.getElementById('fontSize');
        const fontSizeValue = document.getElementById('fontSizeValue');
        fontSizeSlider.addEventListener('input', () => {
            fontSizeValue.textContent = fontSizeSlider.value + 'px';
        });
        
        // 分割线宽度滑块
        const dividerSlider = document.getElementById('dividerWidth');
        const dividerValue = document.getElementById('dividerValue');
        dividerSlider.addEventListener('input', () => {
            dividerValue.textContent = dividerSlider.value + 'px';
        });
        
        // 水印大小滑块
        const watermarkSizeSlider = document.getElementById('watermarkSize');
        const watermarkSizeValue = document.getElementById('watermarkSizeValue');
        watermarkSizeSlider.addEventListener('input', () => {
            watermarkSizeValue.textContent = watermarkSizeSlider.value + 'px';
        });
        
        // 水印透明度滑块
        const watermarkOpacitySlider = document.getElementById('watermarkOpacity');
        const watermarkOpacityValue = document.getElementById('watermarkOpacityValue');
        watermarkOpacitySlider.addEventListener('input', () => {
            watermarkOpacityValue.textContent = watermarkOpacitySlider.value + '%';
        });

        // 滤镜强度滑块
        const filterIntensity = document.getElementById('filterIntensity');
        const intensityValue = document.getElementById('intensityValue');
        filterIntensity.addEventListener('input', () => {
            intensityValue.textContent = filterIntensity.value + '%';
        });
        
        // 文本区域字符统计
        const subtitleText = document.getElementById('subtitleText');
        const lineCount = document.getElementById('lineCount');
        const charCount = document.getElementById('charCount');
        
        subtitleText.addEventListener('input', () => {
            const text = subtitleText.value;
            const lines = text.split('\n').length;
            const chars = text.length;
            lineCount.textContent = lines + ' 行';
            charCount.textContent = chars + ' 字符';
        });
    }
    
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.handleImageFile(file);
    }
    
    handleImageFile(file) {
        // 显示文件信息
        document.getElementById('fileName').textContent = file.name;
        
        // 隐藏上传区域，显示文件信息
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('fileInfo').style.display = 'flex';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            // 显示文件预览
            document.getElementById('filePreview').src = e.target.result;
            
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.extractBackgroundSlice();
                
                // 隐藏空状态，显示预览区域
                document.getElementById('emptyState').style.display = 'none';
                document.getElementById('previewWrapper').style.display = 'flex';
                
                // 立即显示原始图片预览
                this.showOriginalPreview(e.target.result);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    // 提取第一行字幕高度位置的背景切片
    extractBackgroundSlice() {
        if (!this.originalImage) return;
        
        const subtitleHeight = parseInt(document.getElementById('subtitleHeight').value);
        const sliceCanvas = document.createElement('canvas');
        const sliceCtx = sliceCanvas.getContext('2d');
        
        // 设置切片画布尺寸
        sliceCanvas.width = this.originalImage.width;
        sliceCanvas.height = subtitleHeight;
        
        // 计算第一行字幕的Y位置（从底部开始）
        const firstLineY = this.originalImage.height - subtitleHeight * 4; // 假设有4行字幕
        
        // 提取背景切片
        sliceCtx.drawImage(
            this.originalImage,
            0, firstLineY, // 源图片的起始位置
            this.originalImage.width, subtitleHeight, // 源图片的宽高
            0, 0, // 目标画布的起始位置
            this.originalImage.width, subtitleHeight // 目标画布的宽高
        );
        
        this.backgroundSlice = sliceCanvas;
    }
    
    applyFilter() {
        const filterType = document.getElementById('filterType').value;
        const intensity = parseInt(document.getElementById('filterIntensity').value);

        if (filterType === 'none') {
            this.ctx.filter = 'none';
            return;
        }

        let filterValue = 0;
        switch(filterType) {
            case 'grayscale':
            case 'sepia':
                filterValue = Math.min(intensity, 100) / 100;
                break;
            case 'saturate':
            case 'brightness':
            case 'contrast':
                filterValue = intensity / 100;
                break;
            case 'blur':
                filterValue = intensity / 20;
                break;
            default:
                this.ctx.filter = 'none';
                return;
        }

        this.ctx.filter = `${filterType}(${filterValue}${filterType === 'blur' ? 'px' : ''})`;
    }

    generateSubtitle() {
        if (!this.originalImage || !this.backgroundSlice) {
            alert('请先上传图片！');
            return;
        }
        
        const text = document.getElementById('subtitleText').value.trim();
        if (!text) {
            alert('请输入字幕内容！');
            return;
        }
        
        const lines = text.split('\n').filter(line => line.trim());
        const subtitleHeight = parseInt(document.getElementById('subtitleHeight').value);
        const fontSize = parseInt(document.getElementById('fontSize').value);
        const fontColor = document.getElementById('fontColor').value;
        const strokeColor = document.getElementById('strokeColor').value;
        const dividerColor = document.getElementById('dividerColor').value;
        const dividerWidth = parseInt(document.getElementById('dividerWidth').value);
        
        // 设置画布尺寸
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;
        
        // 绘制原始图片并应用滤镜
        this.ctx.save();
        this.applyFilter();
        this.ctx.drawImage(this.originalImage, 0, 0);
        this.ctx.restore();
        
        // 计算字幕区域的起始Y位置
        const totalSubtitleHeight = lines.length * subtitleHeight + (lines.length - 1) * dividerWidth;
        const startY = this.canvas.height - totalSubtitleHeight;
        
        // 绘制每行字幕
        lines.forEach((line, index) => {
            const y = startY + index * (subtitleHeight + dividerWidth);
            
            // 绘制统一的背景切片
            this.ctx.drawImage(
                this.backgroundSlice,
                0, y,
                this.canvas.width, subtitleHeight
            );
            
            // 添加半透明遮罩
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(0, y, this.canvas.width, subtitleHeight);
            
            // 绘制文字
            this.drawText(line, y, subtitleHeight, fontSize, fontColor, strokeColor);
            
            // 绘制分割线（除了最后一行）
            if (index < lines.length - 1) {
                this.drawDivider(y + subtitleHeight, dividerColor, dividerWidth);
            }
        });
        
        // 绘制水印
        this.drawWatermark();
        
        // 显示预览
        this.showPreview();
    }
    
    drawText(text, y, height, fontSize, fontColor, strokeColor) {
        this.ctx.font = `bold ${fontSize}px 'Microsoft YaHei', Arial, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const x = this.canvas.width / 2;
        const textY = y + height / 2;
        
        // 绘制文字描边
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(text, x, textY);
        
        // 绘制文字填充
        this.ctx.fillStyle = fontColor;
        this.ctx.fillText(text, x, textY);
    }
    
    drawDivider(y, color, width) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(this.canvas.width, y);
        this.ctx.stroke();
    }
    
    drawWatermark() {
        const watermarkText = document.getElementById('watermarkText').value.trim();
        if (!watermarkText) return;
        
        const watermarkSize = parseInt(document.getElementById('watermarkSize').value);
        const watermarkOpacity = parseFloat(document.getElementById('watermarkOpacity').value) / 100;
        const watermarkPosition = document.getElementById('watermarkPosition').value;
        
        // 保存当前画布状态
        this.ctx.save();
        
        // 设置水印样式
        this.ctx.font = `${watermarkSize}px Arial, sans-serif`;
        this.ctx.fillStyle = `rgba(255, 255, 255, ${watermarkOpacity})`;
        this.ctx.strokeStyle = `rgba(0, 0, 0, ${watermarkOpacity * 0.5})`;
        this.ctx.lineWidth = 1;
        
        // 计算文字尺寸
        const textMetrics = this.ctx.measureText(watermarkText);
        const textWidth = textMetrics.width;
        const textHeight = watermarkSize;
        
        // 根据位置设置坐标
        let x, y;
        const margin = 20;
        
        switch (watermarkPosition) {
            case 'top-left':
                x = margin;
                y = margin + textHeight;
                this.ctx.textAlign = 'left';
                break;
            case 'top-right':
                x = this.canvas.width - margin;
                y = margin + textHeight;
                this.ctx.textAlign = 'right';
                break;
            case 'bottom-left':
                x = margin;
                y = this.canvas.height - margin;
                this.ctx.textAlign = 'left';
                break;
            case 'bottom-right':
                x = this.canvas.width - margin;
                y = this.canvas.height - margin;
                this.ctx.textAlign = 'right';
                break;
            case 'center':
            default:
                x = this.canvas.width / 2;
                y = this.canvas.height / 2;
                this.ctx.textAlign = 'center';
                break;
        }
        
        this.ctx.textBaseline = 'bottom';
        
        // 绘制水印描边
        this.ctx.strokeText(watermarkText, x, y);
        
        // 绘制水印文字
        this.ctx.fillText(watermarkText, x, y);
        
        // 恢复画布状态
        this.ctx.restore();
    }
    
    showOriginalPreview(imageSrc) {
        const preview = document.getElementById('preview');
        preview.src = imageSrc;
        preview.style.display = 'block';
        
        // 应用当前缩放级别
        this.updateZoom();
    }
    
    showPreview() {
        const preview = document.getElementById('preview');
        preview.src = this.canvas.toDataURL('image/png');
        preview.style.display = 'block';
        document.getElementById('saveBtn').disabled = false;
document.getElementById('shareBtn').disabled = false;
        
        // 应用当前缩放级别
        this.updateZoom();
    }
    
    saveImage() {
    const link = document.createElement('a');
    link.download = 'subtitle-image.png';
    link.href = this.canvas.toDataURL('image/png');
    link.click();
}

shareImage() {
    if (!this.canvas) return;
    
    this.canvas.toBlob(blob => {
        if (!blob) {
            alert('无法生成分享图片');
            return;
        }
        
        const file = new File([blob], 'subtitle-image.png', { type: 'image/png' });
        const shareData = {
            title: '分享图片',
            text: '查看我生成的字幕图片！',
            files: [file]
        };
        
        if (navigator.share && navigator.canShare(shareData)) {
            navigator.share(shareData)
                .then(() => console.log('分享成功'))
                .catch(error => console.log('分享失败:', error));
        } else {
            // 降级方案：复制图片到剪贴板
            try {
                navigator.clipboard.write([
                    new ClipboardItem({
                        'image/png': blob
                    })
                ]).then(() => {
                    alert('图片已复制到剪贴板，您可以手动粘贴分享');
                }).catch(err => {
                    console.error('无法复制图片:', err);
                    alert('分享功能不受支持，请先保存图片再手动分享');
                });
            } catch (e) {
                alert('分享功能不受支持，请先保存图片再手动分享');
            }
        }
    }, 'image/png');
}
}

// 初始化应用
new SubtitleGenerator();