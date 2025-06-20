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