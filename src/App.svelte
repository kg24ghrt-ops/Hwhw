<script lang="ts">
  import { onMount } from 'svelte';
  import Paper from './lib/Paper.svelte';
  import { PAPER_SPEC_A4_COLLEGE } from './lib/paperConfig';
  
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
  
  function getAverageConfidence(): number {
    if (filteredData.length === 0) return 0;
    const sum = filteredData.reduce((acc, item) => acc + item.confidence, 0);
    return Math.round(sum / filteredData.length);
  }
  
  let devicePixelRatio = $state(1);
  
  onMount(() => {
    devicePixelRatio = window.devicePixelRatio || 1;
    const mediaQuery = window.matchMedia('(resolution: 2dppx)');
    mediaQuery.addEventListener('change', () => {
      devicePixelRatio = window.devicePixelRatio || 1;
    });
    return () => mediaQuery.removeEventListener('change', () => {});
  });
</script>

<Paper spec={PAPER_SPEC_A4_COLLEGE} dpi={96 * devicePixelRatio}>
  <main class="research-tool">
    <header class="tool-header">
      <h1>Research Analysis Tool</h1>
    </header>
    
    <section class="controls-section">
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
          {sortOrder === 'asc' ? 'Asc' : 'Desc'}
        </button>
      </div>
      
      <div class="stats-bar">
        <span class="stat-item">Total: <strong>{researchData.length}</strong></span>
        <span class="stat-item">Showing: <strong>{filteredData.length}</strong></span>
        <span class="stat-item">Avg Confidence: <strong>{getAverageConfidence()}%</strong></span>
      </div>
    </section>
    
    <section class="results-section">
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
                    <div 
                      class="confidence-fill" 
                      style="width: {item.confidence}%; background-color: {getConfidenceColor(item.confidence)};"
                    ></div>
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
    </section>
  </main>
</Paper>

<style>
  .research-tool {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: transparent;
  }
  
  .tool-header {
    margin-bottom: 1.5rem;
  }
  
  .tool-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.8rem;
    font-weight: 600;
    color: #1a1a1a;
    font-family: Georgia, serif;
  }
  
  .controls-section {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .search-box {
    margin-bottom: 1rem;
  }
  
  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-family: Georgia, serif;
    font-size: 0.95em;
    border: 1px solid #3b82f6;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.85);
    color: #1a1a1a;
    transition: all 0.2s;
    box-sizing: border-box;
  }
  
  .search-input:focus {
    outline: none;
    border-color: #1d4ed8;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    background-color: rgba(255, 255, 255, 0.95);
  }
  
  .search-input::placeholder {
    color: #888;
  }
  
  .filters {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
  }
  
  .filter-select {
    padding: 0.5rem 1rem;
    font-family: Georgia, serif;
    font-size: 0.85em;
    border: 1px solid #3b82f6;
    border-radius: 3px;
    background-color: rgba(255, 255, 255, 0.85);
    color: #1d4ed8;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 140px;
  }
  
  .filter-select:hover {
    background-color: rgba(239, 246, 255, 0.9);
  }
  
  .sort-btn {
    padding: 0.5rem 1rem;
    font-family: Georgia, serif;
    font-size: 0.85em;
    border: 1px solid #3b82f6;
    border-radius: 3px;
    background-color: rgba(239, 246, 255, 0.85);
    color: #1d4ed8;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .sort-btn:hover {
    background-color: rgba(219, 234, 254, 0.9);
  }
  
  .stats-bar {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.85em;
    color: #555;
  }
  
  .stat-item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .stat-item strong {
    color: #1a1a1a;
  }
  
  .results-section {
    flex: 1;
    overflow: hidden;
  }
  
  .results-table-container {
    overflow-x: auto;
    margin-bottom: 1rem;
  }
  
  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85em;
    background: transparent;
  }
  
  .results-table th {
    text-align: left;
    padding: 0.75rem 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    color: #1a1a1a;
    font-family: Georgia, serif;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 20;
  }
  
  .results-table td {
    padding: 0.75rem 0.5rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    color: #1a1a1a;
    background: transparent;
  }
  
  .result-row:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  
  .id-cell {
    font-family: Georgia, serif;
    color: #666;
    width: 50px;
    white-space: nowrap;
  }
  
  .title-cell {
    font-weight: 600;
    max-width: 280px;
    word-break: break-word;
  }
  
  .author-cell {
    font-style: italic;
    color: #555;
  }
  
  .date-cell {
    font-family: Georgia, serif;
    font-size: 0.9em;
    white-space: nowrap;
    color: #666;
  }
  
  .category-cell {
    font-size: 0.85em;
    color: #555;
    white-space: nowrap;
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
    font-family: Georgia, serif;
  }
  
  .confidence-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .confidence-fill {
    height: 6px;
    border-radius: 3px;
    min-width: 25px;
    transition: width 0.3s ease;
  }
  
  .confidence-text {
    font-family: Georgia, serif;
    font-size: 0.85em;
    font-weight: 500;
    min-width: 40px;
    color: #555;
  }
  
  .notes-row {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .notes-cell {
    padding: 0.5rem 0.5rem 1rem 0.5rem !important;
    font-size: 0.85em;
    color: #555;
    font-style: italic;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  }
  
  .notes-label {
    font-weight: 500;
    color: #3b82f6;
    font-style: normal;
    margin-right: 0.5rem;
  }
  
  .no-results {
    text-align: center;
    padding: 3rem 1rem;
    color: #888;
    font-style: italic;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
  }
  
  @media (max-width: 768px) {
    .filters {
      flex-direction: column;
    }
    .filter-select,
    .sort-btn {
      width: 100%;
    }
    .stats-bar {
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .results-table {
      font-size: 0.75em;
    }
    .title-cell {
      max-width: 200px;
    }
    .author-cell,
    .category-cell {
      white-space: normal;
    }
  }
  
  @media (max-width: 480px) {
    .title-cell {
      max-width: 150px;
    }
    .confidence-text {
      min-width: 35px;
      font-size: 0.8em;
    }
    .confidence-fill {
      min-width: 20px;
    }
  }
</style>
