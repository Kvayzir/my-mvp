export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const topics = await fetch('http://localhost:8000/topics/overview', {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
    }}).then(res => res.json());
    console.log('Fetched topics:', topics);
    return {topics};
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

export async function fetchChatReply({ user_id, topic, msg }: { user_id: string, topic: string | null, msg: string }) {
  try {
    const response = await fetch('http://localhost:8000/chat', { //   https://my-mvp-production-4b5f.up.railway.app/chat
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: msg,
            user_id: user_id,
            theme: topic || 'default' // Default to 'general' if no topic
        })
    });
    
    const data = await response.json();
    console.log('Chat initialized:', data);
    return data.response;
  } catch (error) {
    console.error('Error initializing chat:', error);
    return `Welcome to the chat about ${topic}!`;
  }
}