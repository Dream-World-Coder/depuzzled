/*
 * render.hpp ~ ASCII picture of a board
 * ' ' blank    '%' 1x1    '#' horizontal 2x1    '$' vertical 2x1    '@' 2x2
 */
#pragma once
#include "g.hpp"

#include <cstdio>

namespace klotski {

constexpr char GLYPH[8] = {' ',  // EMPTY
                           '%',  // ONE
                           '#',  // HL
                           '#',  // HR
                           '$',  // VT
                           '$',  // VB
                           '@',  // BIG_TL
                           '@'}; // BIG_BODY

inline void print_board(State s) {
  for (int r = 0; r < H; ++r) {
    for (int c = 0; c < W; ++c)
      std::putchar(GLYPH[get(s, r * W + c)]);
    std::putchar('\n');
  }
}

} // namespace klotski
