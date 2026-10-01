/*
 * engine: its the solving engine, purely for solving,
 * so no validation is done here
 * exhaustive bfs
 * klotski::Solution s = klotski::solve(board);
    board -> a State (layout in game.hpp); precondition -> valid(board)
    s.status -> Solved | Unsolvable
    s.path -> boards from start to goal;
    s.path.size() - 1 = number of moves (empty unless Solved)
    s.states reachable states explored
 */
#pragma once
#include "g.hpp"

#include <algorithm>
#include <cstddef>
#include <cstdint>
#include <vector>

namespace klotski {
/*
 * visited set & parent links in flat arrays
 * -> a states identity is its index in bfs order
 * so parents and hash slots are plain 32 bit indices
 * hash table doubles when it is half full, so no fixed limit on state space
 */
class Solver {
  std::vector<State> st_;     // discovered states, in bfs order
  std::vector<uint32_t> par_; // par_[i] -> index of the state that found st_[i]
  std::vector<uint32_t>
      tab_; // open addressing, slot -> index + 1, 0 -> empty; size -> 2^bits_
  int bits_ = 16;

  size_t slot(State s) const {
    return size_t((s * 0x9E3779B97F4A7C15ull) >> (64 - bits_));
  }

  void grow() {
    ++bits_;
    tab_.assign(size_t(1) << bits_, 0);
    for (size_t i = 0; i < st_.size(); ++i) {
      size_t h = slot(st_[i]);
      while (tab_[h])
        h = (h + 1) & (tab_.size() - 1);
      tab_[h] = uint32_t(i + 1);
    }
  }

  void add(State s, uint32_t parent) {
    size_t h = slot(s);
    while (tab_[h]) {
      if (st_[tab_[h] - 1] == s)
        return;
      h = (h + 1) & (tab_.size() - 1);
    }
    st_.push_back(s);
    par_.push_back(parent);
    tab_[h] = uint32_t(st_.size());
    if (st_.size() * 2 > tab_.size())
      grow();
  }

public:
  Solver() : tab_(size_t(1) << 16) {}

  std::ptrdiff_t run(State start) {
    add(start, 0);
    std::ptrdiff_t goal = -1;
    for (size_t head = 0; head < st_.size(); ++head) {
      const State s = st_[head]; // copying cuz add() may reallocate st_
      if (goal < 0 && is_goal(s))
        goal = std::ptrdiff_t(head);
      MoveList m;
      gen_moves(s, m);
      for (int i = 0; i < m.n; ++i)
        add(m.s[i], uint32_t(head));
    }
    return goal;
  }

  size_t size() const { return st_.size(); }

  // boards from [start to st_[goal]] (inclusive)
  std::vector<State> path(std::ptrdiff_t goal) const {
    std::vector<State> p;
    for (size_t i = size_t(goal);; i = par_[i]) {
      p.push_back(st_[i]);
      if (i == 0)
        break;
    }
    std::reverse(p.begin(), p.end());
    return p;
  }
};

enum class Status { Solved, Unsolvable };

struct Solution {
  Status status = Status::Unsolvable;
  std::vector<State> path; // start <-> goal; empty unless status == Solved
  size_t states = 0;       // reachable states explored
};

// precondition -> valid(start)
inline Solution solve(State start) {
  Solution out;
  Solver sv;
  const std::ptrdiff_t goal = sv.run(start);
  out.states = sv.size();
  if (goal < 0) {
    out.status = Status::Unsolvable;
    return out;
  }
  out.status = Status::Solved;
  out.path = sv.path(goal);
  return out;
}

} // namespace klotski
