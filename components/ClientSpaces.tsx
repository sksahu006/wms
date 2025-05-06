// ./Spaces.tsx
export default function Spaces({ clientId }: { clientId: string }) {
    // Fetch spaces related to the clientId, or any necessary API call
    // You can use React Query here to fetch the data
  
    return (
      <div>
        <h2>Client {clientId}'s Spaces</h2>
        {/* Map over the fetched data and display spaces */}
        <ul>
          {/* This is just a mock example */}
          <li>Space 1</li>
          <li>Space 2</li>
          <li>Space 3</li>
        </ul>
      </div>
    );
  }
  