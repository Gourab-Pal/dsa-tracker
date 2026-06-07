export const STORAGE_KEY = 'dsa-tracker-questions'

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']
export const STATUSES = ['Not Started', 'In Progress', 'Solved']
export const SOURCES = ['LeetCode', 'GFG', 'HackerRank', 'CodeChef', 'Codeforces', 'InterviewBit', 'NeetCode', 'Striver', 'Other']

export const TOPICS = [
  'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'Hash Map', 'Binary Search', 'Two Pointers', 'Sliding Window',
  'Trees', 'Binary Tree', 'BST', 'Heap', 'Trie',
  'Graphs', 'BFS', 'DFS', 'Topological Sort',
  'Dynamic Programming', 'Greedy', 'Backtracking', 'Recursion',
  'Bit Manipulation', 'Math', 'Sorting', 'Divide & Conquer',
  'Union Find', 'Segment Tree', 'Intervals', 'Matrix',
]

export const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Meta', 'Apple',
  'Netflix', 'Uber', 'Bloomberg', 'Adobe', 'Oracle',
  'Goldman Sachs', 'Salesforce', 'LinkedIn', 'Twitter',
  'Walmart', 'Flipkart', 'Swiggy', 'Razorpay', 'PhonePe',
  'Atlassian', 'Intuit', 'VMware', 'Samsung', 'TCS',
  'Infosys', 'Wipro',
]

export const STATUS_CYCLE = {
  'Not Started': 'In Progress',
  'In Progress': 'Solved',
  'Solved': 'Not Started',
}
