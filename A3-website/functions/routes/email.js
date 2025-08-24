const express = require('express')
const nodemailer = require('nodemailer')
const { authenticateToken } = require('./auth')
const router = express.Router()

// Email configuration
const createTransporter = () => {
  // Use environment variables for email configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'your-email@gmail.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    }
  })
}

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Our Platform!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">Welcome {{name}}!</h2>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>Your account has been successfully created with the following details:</p>
        <ul>
          <li><strong>Username:</strong> {{username}}</li>
          <li><strong>Email:</strong> {{email}}</li>
          <li><strong>Role:</strong> {{role}}</li>
        </ul>
        <p>You can now log in and start exploring all the features we have to offer.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="{{loginUrl}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Login Now</a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  },
  notification: {
    subject: 'New Notification - {{title}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">{{title}}</h2>
        <p>Hello {{name}},</p>
        <p>{{message}}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p><strong>Details:</strong></p>
          <p>{{details}}</p>
        </div>
        <p>This notification was sent on {{date}}.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  },
  report: {
    subject: 'Weekly Report - {{week}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6f42c1;">Weekly Report</h2>
        <p>Hello {{name}},</p>
        <p>Here's your weekly activity report for {{week}}:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Metric</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Value</th>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 12px;">Posts Created</td>
            <td style="border: 1px solid #dee2e6; padding: 12px;">{{posts}}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 12px;">Engagement Score</td>
            <td style="border: 1px solid #dee2e6; padding: 12px;">{{engagement}}%</td>
          </tr>
          <tr>
            <td style="border: 1px solid #dee2e6; padding: 12px;">Active Days</td>
            <td style="border: 1px solid #dee2e6; padding: 12px;">{{activeDays}}</td>
          </tr>
        </table>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `
  }
}

// Helper function to replace template variables
const replaceTemplateVariables = (template, variables) => {
  let result = template
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    result = result.replace(regex, variables[key] || '')
  })
  return result
}

// POST /api/email/send - Send single email
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { to, subject, message, template, templateData } = req.body

    if (!to || (!message && !template)) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Recipient email and message/template are required'
      })
    }

    let emailContent = {
      from: process.env.SMTP_FROM || 'noreply@platform.com',
      to,
      subject: subject || 'Message from Platform'
    }

    if (template && emailTemplates[template]) {
      // Use template
      const templateConfig = emailTemplates[template]
      emailContent.subject = replaceTemplateVariables(templateConfig.subject, templateData || {})
      emailContent.html = replaceTemplateVariables(templateConfig.html, templateData || {})
    } else {
      // Use plain message
      emailContent.text = message
      if (message.includes('<')) {
        emailContent.html = message
      }
    }

    const transporter = createTransporter()
    const info = await transporter.sendMail(emailContent)

    res.json({
      message: 'Email sent successfully',
      messageId: info.messageId,
      recipient: to
    })

  } catch (error) {
    console.error('Send email error:', error)
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message
    })
  }
})

// POST /api/email/send-bulk - Send bulk emails
router.post('/send-bulk', authenticateToken, async (req, res) => {
  try {
    const { recipients, subject, message, template, templateData } = req.body

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        error: 'Invalid recipients',
        message: 'Recipients must be a non-empty array'
      })
    }

    if (!message && !template) {
      return res.status(400).json({
        error: 'Missing content',
        message: 'Message or template is required'
      })
    }

    const transporter = createTransporter()
    const results = []
    const errors = []

    for (const recipient of recipients) {
      try {
        let emailContent = {
          from: process.env.SMTP_FROM || 'noreply@platform.com',
          to: recipient.email || recipient,
          subject: subject || 'Bulk Message from Platform'
        }

        if (template && emailTemplates[template]) {
          // Use template with personalized data
          const personalizedData = {
            ...templateData,
            name: recipient.name || recipient.email || recipient,
            email: recipient.email || recipient
          }
          const templateConfig = emailTemplates[template]
          emailContent.subject = replaceTemplateVariables(templateConfig.subject, personalizedData)
          emailContent.html = replaceTemplateVariables(templateConfig.html, personalizedData)
        } else {
          // Use plain message
          emailContent.text = message
          if (message.includes('<')) {
            emailContent.html = message
          }
        }

        const info = await transporter.sendMail(emailContent)
        results.push({
          recipient: recipient.email || recipient,
          status: 'sent',
          messageId: info.messageId
        })

      } catch (error) {
        errors.push({
          recipient: recipient.email || recipient,
          status: 'failed',
          error: error.message
        })
      }
    }

    res.json({
      message: 'Bulk email operation completed',
      summary: {
        total: recipients.length,
        sent: results.length,
        failed: errors.length
      },
      results,
      errors
    })

  } catch (error) {
    console.error('Send bulk email error:', error)
    res.status(500).json({
      error: 'Failed to send bulk emails',
      message: error.message
    })
  }
})

// GET /api/email/templates - Get available email templates
router.get('/templates', authenticateToken, (req, res) => {
  try {
    const templates = Object.keys(emailTemplates).map(key => ({
      name: key,
      subject: emailTemplates[key].subject,
      description: getTemplateDescription(key)
    }))

    res.json({
      templates
    })

  } catch (error) {
    console.error('Get templates error:', error)
    res.status(500).json({
      error: 'Failed to retrieve templates'
    })
  }
})

// GET /api/email/templates/:name - Get specific template
router.get('/templates/:name', authenticateToken, (req, res) => {
  try {
    const templateName = req.params.name
    const template = emailTemplates[templateName]

    if (!template) {
      return res.status(404).json({
        error: 'Template not found'
      })
    }

    res.json({
      name: templateName,
      template,
      description: getTemplateDescription(templateName),
      variables: getTemplateVariables(template.html)
    })

  } catch (error) {
    console.error('Get template error:', error)
    res.status(500).json({
      error: 'Failed to retrieve template'
    })
  }
})

// POST /api/email/test - Test email configuration
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const { testEmail } = req.body
    const recipient = testEmail || req.user.email

    const transporter = createTransporter()
    
    // Verify connection
    await transporter.verify()

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@platform.com',
      to: recipient,
      subject: 'Email Configuration Test',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">Email Test Successful!</h2>
          <p>This is a test email to verify that your email configuration is working correctly.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Sent at: ${new Date().toISOString()}</li>
            <li>Recipient: ${recipient}</li>
            <li>Sender: ${req.user.username} (${req.user.email})</li>
          </ul>
          <p>If you received this email, your email service is configured properly!</p>
        </div>
      `
    })

    res.json({
      message: 'Test email sent successfully',
      messageId: info.messageId,
      recipient
    })

  } catch (error) {
    console.error('Test email error:', error)
    res.status(500).json({
      error: 'Email test failed',
      message: error.message
    })
  }
})

// Helper functions
function getTemplateDescription(templateName) {
  const descriptions = {
    welcome: 'Welcome email for new users',
    notification: 'General notification email',
    report: 'Weekly activity report email'
  }
  return descriptions[templateName] || 'Email template'
}

function getTemplateVariables(html) {
  const matches = html.match(/{{(\w+)}}/g)
  if (!matches) return []
  return [...new Set(matches.map(match => match.replace(/[{}]/g, '')))]
}

module.exports = router