import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-20 pb-20">
      <div className="content-width">
        <motion.div
          className="max-w-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-8">
            关于
          </h1>

          <div className="space-y-5 text-text-secondary leading-relaxed text-sm">
            <p>
              你好，我是大猪。
            </p>
            <p>
              写代码的，平时喜欢听歌、看电影、偶尔拍照。
              这个网站是我在互联网上的一个小角落，用来记录看过的好电影、
              喜欢听的专辑、工作中学到的技术笔记，还有一些零零散散的随笔。
            </p>
            <p>
              不追求流量，不搞 SEO，不写标题党。
              只是想有一个地方，安安静静地放自己的东西。
            </p>
            <p>
              如果偶然路过，欢迎随便看看。
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-xs text-text-muted">
              hello@dazhu.dev
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
