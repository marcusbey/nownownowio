"use client";

import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { motion } from "framer-motion";
import { Code2, ExternalLink } from "lucide-react";

export function WidgetShowcase() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" className="mb-4 text-white">
              Embed Your Posts Anywhere
            </Typography>
            <Typography className="mb-8 text-slate-400">
              Share your content across the web with our lightweight, customizable widget.
              Just add a simple script to your website and your posts will appear instantly.
            </Typography>
          </motion.div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* Widget Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <Typography variant="h3" className="text-white">
                Widget Preview
              </Typography>
              <Button variant="ghost" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Live Demo
              </Button>
            </div>
            <div className="space-y-4">
              {/* Sample Posts */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-800 bg-slate-900 p-4"
                >
                  <div className="mb-2 flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-slate-800" />
                    <div>
                      <Typography className="font-medium text-white">
                        Sample Post {i}
                      </Typography>
                      <Typography className="text-sm text-slate-400">
                        2 hours ago
                      </Typography>
                    </div>
                  </div>
                  <Typography className="text-slate-300">
                    This is a sample post that demonstrates how your content will
                    appear in the widget.
                  </Typography>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Code Sample */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <Typography variant="h3" className="text-white">
                Integration Code
              </Typography>
              <Button variant="ghost" size="sm">
                <Code2 className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-lg bg-slate-950 p-4">
              <code className="text-sm text-slate-300">
                {`<script>
  (function(w,d,s,o,f,js,fjs){
    w['NowNowNow-Widget']=o;
    w[o]=w[o]||function(){
      (w[o].q=w[o].q||[]).push(arguments)
    };
    js=d.createElement(s),
    fjs=d.getElementsByTagName(s)[0];
    js.id=o;
    js.src=f;
    js.async=1;
    fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','nnw',
    'https://widget.nownownow.io/v1'));
  
  nnw('init', { 
    userId: 'YOUR_USER_ID'
  });
</script>
<div id="nnw-feed"></div>`}
              </code>
            </pre>
            <div className="mt-4">
              <Typography className="text-sm text-slate-400">
                Add this code to your website where you want the widget to appear.
                Customize the appearance and behavior through our dashboard.
              </Typography>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
