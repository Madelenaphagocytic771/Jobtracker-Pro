import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.qq.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.QQ_MAIL_USER,
    pass: process.env.QQ_MAIL_PASS,
  },
});

export async function sendResetEmail(to: string, name: string, token: string) {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"JobTracker Pro" <${process.env.QQ_MAIL_USER}>`,
    to,
    subject: '【JobTracker Pro】密码重置',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f8fafc; border-radius: 12px;">
        <h2 style="color: #1e293b; margin-bottom: 8px;">密码重置请求</h2>
        <p style="color: #64748b;">你好，<strong>${name}</strong>！</p>
        <p style="color: #64748b;">我们收到了你的密码重置请求。点击下方按钮重置密码：</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 28px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">重置密码</a>
        <p style="color: #94a3b8; font-size: 13px;">此链接 15 分钟内有效，仅可使用一次。</p>
        <p style="color: #94a3b8; font-size: 13px;">如果你没有发起此请求，请忽略此邮件。</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #cbd5e1; font-size: 12px;">JobTracker Pro · 个人求职全链路追踪系统</p>
      </div>
    `,
  });
}
