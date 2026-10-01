/* game.hpp: klotski rules on a 5x4 board,
 * renamed to g.hpp for compressed engine */
#pragma once
#include <cstdint>
#include <initializer_list>
#include <utility>

namespace klotski {

using State = uint64_t;

constexpr int W = 4, H = 5, N = W * H;
enum : unsigned { EMPTY, ONE, HL, HR, VT, VB, BIG_TL, BIG_BODY };

constexpr State low_bits() { // bit 0 of every 3 bit field
  State m = 0;
  for (int i = 0; i < N; ++i)
    m |= State(1) << (3 * i);
  return m;
}
constexpr State LOW = low_bits();

constexpr unsigned get(State s, int i) { return unsigned(s >> (3 * i)) & 7; }
constexpr State set(State s, int i, unsigned v) {
  return (s & ~(State(7) << (3 * i))) | (State(v) << (3 * i));
}

/*
 * text to board parse, 20 chars row major
 * . empty, o 1x1, < > horizontal
 * ^ v vertical, # 2x2
 * first unclaimed '#' in reading order is its top left
 */
constexpr State from_rows(const char *t) {
  State s = 0;
  unsigned claimed = 0; // cells already assigned to a 2x2
  for (int i = 0; i < N; ++i) {
    unsigned v = EMPTY;
    switch (t[i]) {
    case 'o':
      v = ONE;
      break;
    case '<':
      v = HL;
      break;
    case '>':
      v = HR;
      break;
    case '^':
      v = VT;
      break;
    case 'v':
      v = VB;
      break;
    case '#':
      if ((claimed >> i) & 1) {
        v = BIG_BODY;
      } else {
        v = BIG_TL;
        claimed |=
            (1u << i) | (1u << (i + 1)) | (1u << (i + W)) | (1u << (i + W + 1));
      }
      break;
    default:
      break;
    }
    s |= State(v) << (3 * i);
  }
  return s;
}

// default puzzle: 1 2x2, 4 1x2, 1 2x1, 4 1x1, 2 blanks
constexpr State START = from_rows("^##^"
                                  "v##v"
                                  "^<>^"
                                  "voov"
                                  "o..o");

// true iff every piece is complete, in bounds and non overlapping,
// and no stray bits are set
inline bool valid(State s) {
  if (s >> (3 * N))
    return false;
  unsigned used = 0; // cells already occupied by a piece
  auto take = [&](int i, unsigned code) {
    if (((used >> i) & 1) || get(s, i) != code)
      return false;
    used |= 1u << i;
    return true;
  };
  for (int i = 0; i < N; ++i) {
    if ((used >> i) & 1)
      continue; // second half of a piece that is visited earlier
    const int r = i / W, c = i % W;
    switch (get(s, i)) {
    case EMPTY:
    case ONE:
      break;
    case HL:
      if (c == W - 1 || !take(i, HL) || !take(i + 1, HR))
        return false;
      break;
    case VT:
      if (r == H - 1 || !take(i, VT) || !take(i + W, VB))
        return false;
      break;
    case BIG_TL:
      if (c == W - 1 || r == H - 1 || !take(i, BIG_TL) ||
          !take(i + 1, BIG_BODY) || !take(i + W, BIG_BODY) ||
          !take(i + W + 1, BIG_BODY))
        return false;
      break;
    default:
      return false; // HR, VB, BIG_BODY not occupied by any piece
    }
  }
  return true;
}

// goal: a 2x2 whose top-left cell is r3c1
constexpr int GOAL_CELL = 3 * W + 1;
constexpr bool is_goal(State s) { return get(s, GOAL_CELL) == BIG_TL; }

struct MoveList {
  State s[128]; // bound: <= 4 pulls per piece adjacent blank + <= 2 pair moves
                // per adjacent blank pair
  int n = 0;
  void push(State x) { s[n++] = x; }
};

// every state reachable by sliding one piece one cell;
// each neighbour is produced exactly once;
inline void gen_moves(State s, MoveList &out) {
  const State blanks =
      ~(s | s >> 1 | s >> 2) & LOW; // bit 3i set <-> cell i is empty
  auto blank = [&](int i) { return ((blanks >> (3 * i)) & 1) != 0; };
  auto move = [&](std::initializer_list<std::pair<int, unsigned>> writes) {
    State t = s;
    for (const auto &w : writes)
      t = set(t, w.first, w.second);
    out.push(t);
  };

  for (State m = blanks; m; m &= m - 1) {
    const int e = __builtin_ctzll(m) / 3, r = e / W, c = e % W;

    // 1 blank is enough for a 1x1 to slide in
    // or a domino to slide in along its own axis
    if (r > 0) { // piece above e moves down
      const int n = e - W;
      const unsigned x = get(s, n);
      if (x == ONE)
        move({{e, ONE}, {n, EMPTY}});
      else if (x == VB)
        move({{n - W, EMPTY}, {n, VT}, {e, VB}});
    }
    if (r < H - 1) { // piece below e moves up
      const int n = e + W;
      const unsigned x = get(s, n);
      if (x == ONE)
        move({{e, ONE}, {n, EMPTY}});
      else if (x == VT)
        move({{n + W, EMPTY}, {n, VB}, {e, VT}});
    }
    if (c > 0) { // piece left of e moves right
      const int n = e - 1;
      const unsigned x = get(s, n);
      if (x == ONE)
        move({{e, ONE}, {n, EMPTY}});
      else if (x == HR)
        move({{n - 1, EMPTY}, {n, HL}, {e, HR}});
    }
    if (c < W - 1) { // piece right of e moves left
      const int n = e + 1;
      const unsigned x = get(s, n);
      if (x == ONE)
        move({{e, ONE}, {n, EMPTY}});
      else if (x == HL)
        move({{n + 1, EMPTY}, {n, HR}, {e, HL}});
    }

    // sliding across a short side or moving the 2x2 needs two aligned blanks
    // (a, b) & each adjacent blank pair is visited once, from its first cell
    if (c < W - 1 && blank(e + 1)) { // blanks side by side
      const int a = e, b = e + 1;
      if (r > 0) { // the row above moves down
        const int u = a - W, v = b - W;
        if (get(s, u) == HL && get(s, v) == HR)
          move({{u, EMPTY}, {v, EMPTY}, {a, HL}, {b, HR}});
        else if (r > 1 && get(s, u - W) == BIG_TL)
          move({{u - W, EMPTY},
                {v - W, EMPTY},
                {u, BIG_TL},
                {v, BIG_BODY},
                {a, BIG_BODY},
                {b, BIG_BODY}});
      }
      if (r < H - 1) { // the row below moves up
        const int u = a + W, v = b + W;
        if (get(s, u) == HL && get(s, v) == HR)
          move({{u, EMPTY}, {v, EMPTY}, {a, HL}, {b, HR}});
        else if (get(s, u) == BIG_TL)
          move({{u + W, EMPTY},
                {v + W, EMPTY},
                {a, BIG_TL},
                {b, BIG_BODY},
                {u, BIG_BODY},
                {v, BIG_BODY}});
      }
    }
    if (r < H - 1 && blank(e + W)) { // blanks stacked
      const int a = e, b = e + W;
      if (c > 0) { // the column to the left moves right
        const int u = a - 1, v = b - 1;
        if (get(s, u) == VT && get(s, v) == VB)
          move({{u, EMPTY}, {v, EMPTY}, {a, VT}, {b, VB}});
        else if (c > 1 && get(s, u - 1) == BIG_TL)
          move({{u - 1, EMPTY},
                {v - 1, EMPTY},
                {u, BIG_TL},
                {v, BIG_BODY},
                {a, BIG_BODY},
                {b, BIG_BODY}});
      }
      if (c < W - 1) { // the column to the right moves left
        const int u = a + 1, v = b + 1;
        if (get(s, u) == VT && get(s, v) == VB)
          move({{u, EMPTY}, {v, EMPTY}, {a, VT}, {b, VB}});
        else if (get(s, u) == BIG_TL)
          move({{u + 1, EMPTY},
                {v + 1, EMPTY},
                {a, BIG_TL},
                {b, BIG_BODY},
                {u, BIG_BODY},
                {v, BIG_BODY}});
      }
    }
  }
}

} // namespace klotski
