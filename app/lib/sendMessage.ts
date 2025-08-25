export default async function sendMessage (userId: number, text: string) {
  try {
    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        message: text
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};