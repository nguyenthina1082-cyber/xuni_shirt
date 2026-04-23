import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(userEmail: string, userName: string) {
  await resend.emails.send({
    from: '贝塔换衣间 <hello@runvo.xyz>',
    to: userEmail,
    subject: '欢迎来到贝塔换衣间 ✨',
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，欢迎来到贝塔换衣间！</h2>
        <p>在这里，你可以上传人物照片和服装图片，AI会自动帮你完成换装。</p>
        <p>无论是想看衣服穿在自己身上的效果，还是寻找穿搭灵感，贝塔换衣间都能帮你实现。</p>
        <br/>
        <p><strong>使用方式：</strong></p>
        <ol style="color: #666;">
          <li>上传人物照片（第一张）</li>
          <li>上传服装图片（第二张）</li>
          <li>描述你想要的效果，AI帮你完成换装</li>
        </ol>
        <br/>
        <p>开始你的换装之旅吧！</p>
        <p>—— 贝塔换衣间</p>
      </div>
    `,
  });
}
