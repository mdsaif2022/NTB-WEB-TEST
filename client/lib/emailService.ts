import { realtimeDb } from './firebaseConfig';
import { ref, set, get, push } from 'firebase/database';

// Email notification service
export const emailService = {
  // Get admin email settings
  async getAdminEmailSettings() {
    if (!realtimeDb) return null;

    try {
      const emailSettingsRef = ref(realtimeDb, 'adminSettings/email');
      const snapshot = await get(emailSettingsRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching admin email settings:', error);
      return null;
    }
  },

  // Update admin email settings
  async updateAdminEmailSettings(emailSettings: any) {
    if (!realtimeDb) return false;

    try {
      const emailSettingsRef = ref(realtimeDb, 'adminSettings/email');
      await set(emailSettingsRef, {
        ...emailSettings,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error('Error updating admin email settings:', error);
      return false;
    }
  },

  // Send booking notification email
  async sendBookingNotification(bookingData: any) {
    if (!realtimeDb) return false;

    try {
      const emailSettings = await this.getAdminEmailSettings();
      const adminEmail = emailSettings?.adminEmail || 'boraborsaifuddinvaiya@gmail.com';

      const notificationData = {
        type: 'booking',
        to: adminEmail,
        subject: `New Tour Booking - ${bookingData.tourName}`,
        bookingId: bookingData.id,
        tourName: bookingData.tourName,
        customerName: bookingData.customerInfo?.name || 'Unknown',
        customerEmail: bookingData.customerInfo?.email || 'Unknown',
        customerPhone: bookingData.customerInfo?.phone || 'Unknown',
        amount: bookingData.amount || 0,
        bookingDate: bookingData.bookingDate || new Date().toISOString(),
        status: bookingData.status || 'pending',
        createdAt: new Date().toISOString(),
        // Email content
        htmlContent: this.generateBookingEmailHTML(bookingData),
        textContent: this.generateBookingEmailText(bookingData)
      };

      const notificationsRef = ref(realtimeDb, 'emailNotifications');
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, notificationData);

      console.log('Booking notification email queued for:', adminEmail);
      return true;
    } catch (error) {
      console.error('Error sending booking notification:', error);
      return false;
    }
  },

  // Send blog post notification email
  async sendBlogNotification(blogData: any) {
    if (!realtimeDb) return false;

    try {
      const emailSettings = await this.getAdminEmailSettings();
      const adminEmail = emailSettings?.adminEmail || 'boraborsaifuddinvaiya@gmail.com';

      const notificationData = {
        type: 'blog',
        to: adminEmail,
        subject: `New Blog Post Submission - ${blogData.title}`,
        blogId: blogData.id,
        title: blogData.title,
        authorName: blogData.author?.name || 'Unknown',
        authorEmail: blogData.author?.email || 'Unknown',
        category: blogData.category || 'General',
        status: blogData.status || 'pending',
        submissionDate: blogData.submissionDate || new Date().toISOString(),
        createdAt: new Date().toISOString(),
        // Email content
        htmlContent: this.generateBlogEmailHTML(blogData),
        textContent: this.generateBlogEmailText(blogData)
      };

      const notificationsRef = ref(realtimeDb, 'emailNotifications');
      const newNotificationRef = push(notificationsRef);
      await set(newNotificationRef, notificationData);

      console.log('Blog notification email queued for:', adminEmail);
      return true;
    } catch (error) {
      console.error('Error sending blog notification:', error);
      return false;
    }
  },

  // Generate HTML content for booking email
  generateBookingEmailHTML(bookingData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Tour Booking Notification</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .action-button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Tour Booking Received</h1>
            <p>Action Required - Admin Approval Needed</p>
          </div>
          
          <div class="content">
            <h2>Booking Details</h2>
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">${bookingData.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tour Package:</span>
                <span class="detail-value">${bookingData.tourName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Customer Name:</span>
                <span class="detail-value">${bookingData.customerInfo?.name || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${bookingData.customerInfo?.email || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value">${bookingData.customerInfo?.phone || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">৳${(bookingData.amount || 0).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Booking Date:</span>
                <span class="detail-value">${new Date(bookingData.bookingDate || new Date()).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge status-pending">${bookingData.status || 'Pending'}</span>
                </span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/admin/bookings" class="action-button">
                View in Admin Panel
              </a>
            </div>

            <div class="footer">
              <p>This is an automated notification from your tourism website.</p>
              <p>Please log in to the admin panel to review and approve this booking.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Generate text content for booking email
  generateBookingEmailText(bookingData: any): string {
    return `
New Tour Booking Received

Booking Details:
- Booking ID: ${bookingData.id}
- Tour Package: ${bookingData.tourName}
- Customer Name: ${bookingData.customerInfo?.name || 'Not provided'}
- Email: ${bookingData.customerInfo?.email || 'Not provided'}
- Phone: ${bookingData.customerInfo?.phone || 'Not provided'}
- Amount: ৳${(bookingData.amount || 0).toLocaleString()}
- Booking Date: ${new Date(bookingData.bookingDate || new Date()).toLocaleDateString()}
- Status: ${bookingData.status || 'Pending'}

Please log in to the admin panel to review and approve this booking:
${window.location.origin}/admin/bookings

This is an automated notification from your tourism website.
    `;
  },

  // Generate HTML content for blog email
  generateBlogEmailHTML(blogData: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Blog Post Submission</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .blog-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #374151; }
          .detail-value { color: #6b7280; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          .status-pending { background: #fef3c7; color: #92400e; }
          .action-button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .excerpt { background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 New Blog Post Submission</h1>
            <p>Action Required - Admin Review Needed</p>
          </div>
          
          <div class="content">
            <h2>Blog Post Details</h2>
            <div class="blog-details">
              <div class="detail-row">
                <span class="detail-label">Blog ID:</span>
                <span class="detail-value">${blogData.id}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Title:</span>
                <span class="detail-value">${blogData.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Author:</span>
                <span class="detail-value">${blogData.author?.name || 'Unknown'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Author Email:</span>
                <span class="detail-value">${blogData.author?.email || 'Not provided'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Category:</span>
                <span class="detail-value">${blogData.category || 'General'}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Submission Date:</span>
                <span class="detail-value">${new Date(blogData.submissionDate || new Date()).toLocaleDateString()}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">
                  <span class="status-badge status-pending">${blogData.status || 'Pending'}</span>
                </span>
              </div>
            </div>

            ${blogData.excerpt ? `
              <div class="excerpt">
                <strong>Excerpt:</strong><br>
                ${blogData.excerpt}
              </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/admin/blogs" class="action-button">
                Review in Admin Panel
              </a>
            </div>

            <div class="footer">
              <p>This is an automated notification from your tourism website.</p>
              <p>Please log in to the admin panel to review and approve this blog post.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  // Generate text content for blog email
  generateBlogEmailText(blogData: any): string {
    return `
New Blog Post Submission

Blog Post Details:
- Blog ID: ${blogData.id}
- Title: ${blogData.title}
- Author: ${blogData.author?.name || 'Unknown'}
- Author Email: ${blogData.author?.email || 'Not provided'}
- Category: ${blogData.category || 'General'}
- Submission Date: ${new Date(blogData.submissionDate || new Date()).toLocaleDateString()}
- Status: ${blogData.status || 'Pending'}

${blogData.excerpt ? `Excerpt: ${blogData.excerpt}` : ''}

Please log in to the admin panel to review and approve this blog post:
${window.location.origin}/admin/blogs

This is an automated notification from your tourism website.
    `;
  },

  // Get all email notifications (for admin panel)
  async getEmailNotifications() {
    if (!realtimeDb) return [];

    try {
      const notificationsRef = ref(realtimeDb, 'emailNotifications');
      const snapshot = await get(notificationsRef);
      if (snapshot.exists()) {
        const notifications = snapshot.val();
        return Object.values(notifications).sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching email notifications:', error);
      return [];
    }
  }
};
