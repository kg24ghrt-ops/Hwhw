<script lang="ts">
  import { onMount } from 'svelte';

  interface ResearchItem {
    id: number;
    title: string;
    author: string;
    date: string;
    category: string;
    status: 'pending' | 'in-progress' | 'completed' | 'reviewed';
    confidence: number;
    notes: string;
  }

  // Realistic test data for the research tool
  const researchData: ResearchItem[] = [
    {
      id: 1,
      title: "Quantum Computing Applications in Cryptography",
      author: "Dr. Sarah Chen",
      date: "2024-03-15",
      category: "Computer Science",
      status: 'completed',
      confidence: 94,
      notes: "Promising results in post-quantum cryptographic algorithms. Key findings suggest RSA-2048 vulnerable by 2030."
    },
    {
      id: 2,
      title: "Neural Network Optimization for Edge Devices",
      author: "Prof. Michael Torres",
      date: "2024-02-28",
      category: "Machine Learning",
      status: 'in-progress',
      confidence: 87,
      notes: "Model compression techniques showing 40% reduction in memory usage with minimal accuracy loss."
    },
    {
      id: 3,
      title: "Sustainable Energy Storage Solutions",
      author: "Dr. Emily Watson",
      date: "2024-03-01",
      category: "Energy",
      status: 'reviewed',
      confidence: 91,
      notes: "Graphene-based supercapacitors demonstrate 3x energy density compared to conventional lithium-ion."
    },
    {
      id: 4,
      title: "CRISPR Gene Editing Safety Protocols",
      author: "Dr. James Liu",
      date: "2024-01-20",
      category: "Biotechnology",
      status: 'completed',
      confidence: 89,
      notes: "Off-target effects reduced by 95% using new guide RNA design algorithms."
    },
    {
      id: 5,
      title: "Climate Change Impact on Ocean Currents",
      author: "Dr. Rachel Green",
      date: "2024-02-10",
      category: "Environmental Science",
      status: 'pending',
      confidence: 76,
      notes: "AMOC slowdown detected at 0.5% per decade. Further monitoring required."
    },
    {
      id: 6,
      title: "Blockchain Scalability Solutions",
      author: "Alex Kumar",
      date: "2024-03-10",
      category: "Computer Science",
      status: 'in-progress',
      confidence: 82,
      notes: "Layer-2 solutions achieving 10,000+ TPS with sub-second finality."
    },
    {
      id: 7,
      title: "AI-Driven Drug Discovery Pipeline",
      author: "Dr. Lisa Park",
      date: "2024-02-25",
      category: "Pharmaceuticals",
      status: 'completed',
      confidence: 93,
      notes: "AlphaFold integration reduces drug candidate screening time from months to days."
    },
    {
      id: 8,
      title: "5G Network Security Vulnerabilities",
      author: "Thomas Anderson",
      date: "2024-03-05",
      category: "Cybersecurity",
      status: 'reviewed',
      confidence: 88,
      notes: "Identified 3 critical vulnerabilities in network slicing implementation."
    }
  ];

  let searchQuery = $state('');
  let selectedCategory = $state('All');
  let selectedStatus = $state('All');
  let filteredData = $state<ResearchItem[]>(researchData);
  let sortBy = $state<'date' | 'confidence' | 'title'>('date');
  let sortOrder = $state<'asc' | 'desc'>('desc');

  const categories = ['All', 'Computer Science', 'Machine Learning', 'Energy', 'Biotechnology', 'Environmental Science', 'Pharmaceuticals', 'Cybersecurity'];
  const statuses = ['All', 'pending', 'in-progress', 'completed', 'reviewed'];

  function filterAndSort() {
    let result = [...researchData];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.author.toLowerCase().includes(query) ||
        item.notes.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(item => item.status === selectedStatus);
    }

    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'confidence') {
        comparison = a.confidence - b.confidence;
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    filteredData = result;
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'completed': return '#16a34a';
      case 'in-progress': return '#2563eb';
      case 'reviewed': return '#7c3aed';
      case 'pending': return '#d97706';
      default: return '#64748b';
    }
  }

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 90) return '#16a34a';
    if (confidence >= 75) return '#2563eb';
    if (confidence >= 60) return '#d97706';
    return '#dc2626';
  }

  $effect(() => {
    filterAndSort();
  });

  // Generate notebook lines
  const lineCount = 25;
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1);
</script>

<main>
  <h1>📚 Research Analysis Tool</h1>
  
  <div class="paper-container">
    <!-- Blueprint measurement markings -->
    <div class="measurements">
      {#each [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as pos}
        <div class="measurements-horz" style="top: {pos}px;"></div>
      {/each}
      {#each [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] as pos}
        <div class="measurements-vert" style="left: {pos + 70}px;"></div>
      {/each}
    </div>

    <!-- Notebook paper lines -->
    <div class="lines-container">
      {#each lines as num}
        <div class="notebook-line" data-number={num}></div>
      {/each}
    </div>

    <!-- Content area -->
    <div class="content-area">
      <!-- Search and Filter Controls -->
      <div class="controls-section">
        <div class="search-box">
          <input 
            type="text" 
            bind:value={searchQuery} 
            placeholder="Search research papers..." 
            class="search-input"
          />
        </div>
        
        <div class="filters">
          <select bind:value={selectedCategory} class="filter-select">
            {#each categories as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
          
          <select bind:value={selectedStatus} class="filter-select">
            {#each statuses as status}
              <option value={status}>{status}</option>
            {/each}
          </select>
          
          <select bind:value={sortBy} class="filter-select">
            <option value="date">Date</option>
            <option value="confidence">Confidence</option>
            <option value="title">Title</option>
          </select>
          
          <button onclick={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'} class="sort-btn">
            {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
          </button>
        </div>
        
        <div class="stats-bar">
          <span class="stat-item">Total: <strong>{researchData.length}</strong></span>
          <span class="stat-item">Showing: <strong>{filteredData.length}</strong></span>
          <span class="stat-item">Avg Confidence: <strong>{Math.round(filteredData.reduce((sum, item) => sum + item.confidence, 0) / (filteredData.length || 1))}%</strong></span>
        </div>
      </div>

      <!-- Research Results Table -->
      <div class="results-table-container">
        <table class="results-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Author</th>
              <th>Date</th>
              <th>Category</th>
              <th>Status</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {#each filteredData as item (item.id)}
              <tr class="result-row">
                <td class="id-cell">#{item.id}</td>
                <td class="title-cell">{item.title}</td>
                <td class="author-cell">{item.author}</td>
                <td class="date-cell">{item.date}</td>
                <td class="category-cell">{item.category}</td>
                <td class="status-cell">
                  <span class="status-badge" style="background-color: {getStatusColor(item.status)};">
                    {item.status}
                  </span>
                </td>
                <td class="confidence-cell">
                  <div class="confidence-bar">
                    <div class="confidence-fill" style="width: {item.confidence}%; background-color: {getConfidenceColor(item.confidence)};"></div>
                    <span class="confidence-text">{item.confidence}%</span>
                  </div>
                </td>
              </tr>
              <tr class="notes-row">
                <td colspan="7" class="notes-cell">
                  <span class="notes-label">Notes:</span> {item.notes}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if filteredData.length === 0}
        <div class="no-results">
          <p>No research items found matching your criteria.</p>
        </div>
      {/if}
    </div>
  </div>
</main>

<style>
  main {
    padding: 1rem 0;
  }

  h1 {
    margin-bottom: 1.5rem;
    text-align: left;
    padding-left: 1rem;
  }

  .controls-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  }

  .search-box {
    margin-bottom: 1rem;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.95em;
    border: 2px solid #3b82f6;
    border-radius: 4px;
    background-color: rgba(255, 255, 255, 0.9);
    color: #1a3a5c;
    transition: all 0.2s;
  }

  .search-input:focus {
    outline: none;
    border-color: #1d4ed8;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  }

  .search-input::placeholder {
    color: #94a3b8;
  }

  .filters {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }

  .filter-select {
    padding: 0.5rem 1rem;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.85em;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    background-color: #eff6ff;
    color: #1d4ed8;
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-select:hover {
    background-color: #dbeafe;
  }

  .sort-btn {
    padding: 0.5rem 1rem;
    font-family: 'Roboto Mono', monospace;
    font-size: 0.85em;
  }

  .stats-bar {
    display: flex;
    gap: 1.5rem;
    font-size: 0.85em;
    color: #64748b;
  }

  .stat-item strong {
    color: #1a3a5c;
  }

  .results-table-container {
    overflow-x: auto;
    margin-bottom: 1rem;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85em;
  }

  .results-table th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    background-color: rgba(59, 130, 246, 0.1);
    border-bottom: 2px solid #3b82f6;
    color: #1d4ed8;
    font-family: 'Roboto Mono', monospace;
    font-weight: 500;
  }

  .results-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid rgba(59, 130, 246, 0.2);
    color: #1a3a5c;
  }

  .result-row:hover {
    background-color: rgba(59, 130, 246, 0.05);
  }

  .id-cell {
    font-family: 'Roboto Mono', monospace;
    color: #64748b;
    width: 60px;
  }

  .title-cell {
    font-weight: 500;
    max-width: 300px;
  }

  .author-cell {
    font-style: italic;
    color: #475569;
  }

  .date-cell {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.9em;
    white-space: nowrap;
  }

  .category-cell {
    font-size: 0.85em;
    color: #475569;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: 500;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .confidence-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .confidence-fill {
    height: 8px;
    border-radius: 4px;
    min-width: 30px;
    transition: width 0.3s ease;
  }

  .confidence-text {
    font-family: 'Roboto Mono', monospace;
    font-size: 0.85em;
    font-weight: 500;
    min-width: 45px;
  }

  .notes-row {
    background-color: rgba(59, 130, 246, 0.03);
  }

  .notes-cell {
    padding: 0.5rem 0.5rem 1rem 0.5rem !important;
    font-size: 0.85em;
    color: #475569;
    font-style: italic;
    border-bottom: 1px dashed rgba(59, 130, 246, 0.15);
  }

  .notes-label {
    font-weight: 500;
    color: #3b82f6;
    font-style: normal;
    margin-right: 0.5rem;
  }

  .no-results {
    text-align: center;
    padding: 3rem;
    color: #64748b;
    font-style: italic;
  }

  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
    }

    .filter-select {
      width: 100%;
    }

    .stats-bar {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .results-table {
      font-size: 0.75em;
    }

    .title-cell {
      max-width: 200px;
    }
  }
</style>
