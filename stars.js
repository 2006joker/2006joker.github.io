// stars.js - 星空背景效果
// 适用于 2006joker.github.io
// 作者：2006joker

(function() {
    'use strict';
    
    // 等待页面完全加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStars);
    } else {
        // 如果文档已经加载完成，直接初始化
        setTimeout(initStars, 100);
    }
    
    function initStars() {
        console.log('✨ 正在初始化星空背景...');
        
        // 1. 创建Canvas元素
        let canvas = document.getElementById('starsCanvas');
        if (!canvas) {
            console.log('📝 创建Canvas元素...');
            canvas = document.createElement('canvas');
            canvas.id = 'starsCanvas';
            canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:-9999;display:block;pointer-events:none;';
            document.body.insertBefore(canvas, document.body.firstChild);
        }
        
        // 获取绘图上下文
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ 无法获取Canvas上下文');
            return;
        }
        
        // 变量定义
        let stars = [];          // 星星数组
        let meteors = [];        // 流星数组
        let animationId = null;  // 动画ID
        let isActive = true;     // 是否激活
        
        // Canvas尺寸
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // 星星类
        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 1.5 + 0.5;
                this.speed = Math.random() * 0.3 + 0.1;
                this.opacity = Math.random() * 0.7 + 0.3;
                this.twinkleSpeed = Math.random() * 0.02 + 0.005;
                this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
                this.color = this.getStarColor();
            }
            
            getStarColor() {
                // 随机生成星星颜色（主要是白色，少量彩色）
                const rand = Math.random();
                if (rand > 0.95) {
                    // 5%的几率是蓝色星星
                    return { r: 150, g: 200, b: 255 };
                } else if (rand > 0.9) {
                    // 5%的几率是黄色星星
                    return { r: 255, g: 255, b: 200 };
                } else {
                    // 90%的几率是白色星星
                    return { r: 255, g: 255, b: 255 };
                }
            }
            
            update() {
                // 闪烁效果
                this.opacity += this.twinkleSpeed * this.twinkleDirection;
                if (this.opacity >= 1) {
                    this.opacity = 0.95;
                    this.twinkleDirection = -1;
                } else if (this.opacity <= 0.2) {
                    this.opacity = 0.25;
                    this.twinkleDirection = 1;
                }
                
                // 缓慢移动
                this.y += this.speed;
                if (this.y > height) {
                    this.y = 0;
                    this.x = Math.random() * width;
                }
            }
            
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
                ctx.fill();
                
                // 大星星有光晕效果
                if (this.size > 1.2) {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`;
                    ctx.fill();
                }
            }
        }
        
        // 流星类
        class Meteor {
            constructor() {
                this.x = Math.random() * width * 0.8 + width * 0.1;
                this.y = -20;
                this.length = 60 + Math.random() * 60;
                this.speed = 6 + Math.random() * 4;
                this.opacity = 1;
                this.angle = Math.PI / 4 + Math.random() * Math.PI / 6;
                this.active = true;
                this.tailLength = 0;
            }
            
            update() {
                this.x += this.speed * Math.cos(this.angle);
                this.y += this.speed * Math.sin(this.angle);
                this.opacity -= 0.015;
                this.tailLength = Math.min(this.tailLength + 5, this.length);
                
                if (this.x > width + 50 || 
                    this.y > height + 50 || 
                    this.opacity <= 0) {
                    this.active = false;
                }
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                
                // 流星尾巴渐变
                const gradient = ctx.createLinearGradient(0, 0, this.tailLength, 0);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(0.1, `rgba(255, 255, 255, ${this.opacity * 0.8})`);
                gradient.addColorStop(0.4, `rgba(200, 220, 255, ${this.opacity * 0.6})`);
                gradient.addColorStop(0.7, `rgba(150, 180, 255, ${this.opacity * 0.3})`);
                gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
                
                // 绘制尾巴
                ctx.fillStyle = gradient;
                ctx.fillRect(0, -0.8, this.tailLength, 1.6);
                
                // 绘制流星头部
                ctx.beginPath();
                ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fill();
                
                // 头部光晕
                ctx.beginPath();
                ctx.arc(0, 0, 5, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.3})`;
                ctx.fill();
                
                ctx.restore();
            }
        }
        
        // 初始化星星
        function initAllStars() {
            stars = [];
            // 根据屏幕大小计算星星数量
            const starCount = Math.floor((width * height) / 3000);
            
            for (let i = 0; i < starCount; i++) {
                stars.push(new Star());
            }
            
            console.log(`✨ 创建了 ${starCount} 颗星星`);
        }
        
        // 创建流星
        function createMeteor() {
            meteors.push(new Meteor());
        }
        
        // 绘制背景
        function drawBackground() {
            // 深蓝色星空背景
            ctx.fillStyle = '#0a0e17';
            ctx.fillRect(0, 0, width, height);
            
            // 绘制深空渐变
            const gradient = ctx.createLinearGradient(0, 0, 0, height);
            gradient.addColorStop(0, '#0a0e17');
            gradient.addColorStop(0.5, '#0c111f');
            gradient.addColorStop(1, '#0a0e17');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        }
        
        // 绘制星云效果
        function drawNebula() {
            // 随机生成几个星云斑点
            const nebulaCount = 2 + Math.floor(Math.random() * 2);
            
            for (let i = 0; i < nebulaCount; i++) {
                const centerX = width * (0.2 + Math.random() * 0.6);
                const centerY = height * (0.2 + Math.random() * 0.6);
                const radius = 80 + Math.random() * 120;
                
                // 创建径向渐变
                const gradient = ctx.createRadialGradient(
                    centerX, centerY, 0,
                    centerX, centerY, radius
                );
                
                // 随机选择星云颜色
                const colorType = Math.floor(Math.random() * 3);
                if (colorType === 0) {
                    // 紫色星云
                    gradient.addColorStop(0, 'rgba(140, 100, 255, 0.08)');
                    gradient.addColorStop(0.7, 'rgba(100, 60, 200, 0.03)');
                    gradient.addColorStop(1, 'rgba(80, 40, 150, 0)');
                } else if (colorType === 1) {
                    // 蓝色星云
                    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.07)');
                    gradient.addColorStop(0.7, 'rgba(70, 120, 220, 0.02)');
                    gradient.addColorStop(1, 'rgba(50, 100, 200, 0)');
                } else {
                    // 粉色星云
                    gradient.addColorStop(0, 'rgba(255, 150, 200, 0.06)');
                    gradient.addColorStop(0.7, 'rgba(220, 120, 180, 0.02)');
                    gradient.addColorStop(1, 'rgba(200, 100, 160, 0)');
                }
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // 主动画循环
        function animate() {
            if (!isActive) return;
            
            // 清除画布
            ctx.clearRect(0, 0, width, height);
            
            // 绘制背景
            drawBackground();
            
            // 绘制星云
            drawNebula();
            
            // 更新和绘制星星
            stars.forEach(star => {
                star.update();
                star.draw();
            });
            
            // 更新和绘制流星
            for (let i = meteors.length - 1; i >= 0; i--) {
                const meteor = meteors[i];
                meteor.update();
                if (meteor.active) {
                    meteor.draw();
                } else {
                    meteors.splice(i, 1);
                }
            }
            
            // 继续动画循环
            animationId = requestAnimationFrame(animate);
        }
        
        // 调整Canvas大小
        function resizeCanvas() {
            width = window.innerWidth;
            height = window.innerHeight;
            
            canvas.width = width;
            canvas.height = height;
            
            // 重新初始化星星
            initAllStars();
            
            console.log(`📏 Canvas调整到 ${width}x${height}`);
        }
        
        // 随机生成流星（根据时间）
        function scheduleMeteors() {
            // 每3-8秒可能创建一个流星
            const nextMeteorTime = 3000 + Math.random() * 5000;
            
            setTimeout(() => {
                if (isActive && Math.random() > 0.3) { // 70%的几率
                    createMeteor();
                }
                scheduleMeteors();
            }, nextMeteorTime);
        }
        
        // 点击创建流星（调试用）
        function setupInteractions() {
            canvas.addEventListener('click', (e) => {
                // 点击位置创建流星
                const meteor = new Meteor();
                meteor.x = e.clientX;
                meteor.y = e.clientY;
                meteor.angle = Math.PI / 4;
                meteors.push(meteor);
            });
            
            // 鼠标移动时星星轻微跟随
            let mouseX = 0, mouseY = 0;
            document.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
                
                // 轻微影响附近的星星
                stars.forEach(star => {
                    const dx = star.x - mouseX;
                    const dy = star.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        const force = (100 - distance) / 500;
                        star.x += dx * force * 0.1;
                        star.y += dy * force * 0.1;
                    }
                });
            });
        }
        
        // 性能优化：页面不可见时暂停动画
        function setupVisibilityHandler() {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    isActive = false;
                    if (animationId) {
                        cancelAnimationFrame(animationId);
                        animationId = null;
                    }
                } else {
                    isActive = true;
                    if (!animationId) {
                        animate();
                    }
                }
            });
        }
        
        // 初始化所有功能
        function setup() {
            resizeCanvas();
            initAllStars();
            setupInteractions();
            setupVisibilityHandler();
            
            // 初始创建几个流星
            setTimeout(() => createMeteor(), 1000);
            setTimeout(() => createMeteor(), 3000);
            
            // 开始流星调度
            scheduleMeteors();
            
            // 开始动画
            animate();
            
            console.log('✅ 星空背景初始化完成！');
        }
        
        // 窗口大小改变时重新调整
        window.addEventListener('resize', () => {
            resizeCanvas();
        });
        
        // 开始设置
        setup();
    }
})();
