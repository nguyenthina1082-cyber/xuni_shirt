import { Resend } from 'resend';
import { generateStyleTip } from '@/services/ark';
import { sql } from '@/lib/db';

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

export async function sendDailyStyleTip(userEmail: string, userName: string) {
  let styleTip = "今日份穿搭灵感来啦，快来看看有没有让你心动的搭配！";
  try {
    styleTip = await generateStyleTip(userName);
  } catch (error) {
    console.error(`AI 生成穿搭文案失败，使用默认文案：`, error);
  }

  await resend.emails.send({
    from: '贝塔换衣间 <hello@runvo.xyz>',
    to: userEmail,
    subject: `早安 ${userName}，今日穿搭灵感已送达 ✨`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Hi ${userName}，早安！</h2>
        <p>${styleTip}</p>
        <br/>
        <p>上传你的照片，来贝塔换衣间试试新穿搭吧～</p>
        <br/>
        <p>—— 贝塔换衣间</p>
        <p style="color: #999; font-size: 12px;">
          想换个造型？<a href="https://runvo.xyz">点我来试试</a>
        </p>
      </div>
    `,
  });
}

export async function sendDailyStyleTipToAll() {
  const users = await sql`SELECT email FROM users`;

  console.log(`📋 查询到 ${users.length} 个用户准备发送邮件`);

  for (const user of users) {
    try {
      const userName = user.email.split('@')[0];
      await sendDailyStyleTip(user.email, userName);
      console.log(`✅ 每日穿搭邮件发送成功: ${user.email}`);
    } catch (error) {
      console.error(`❌ 给 ${user.email} 发送每日穿搭邮件失败：`, error);
    }
  }

  console.log(`📤 邮件发送任务完成`);
}
