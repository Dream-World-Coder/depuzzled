// uses the compressed engine
#include "engine_compressed.hpp"
#include "g.hpp"
#include "render.hpp"

#include <chrono>
#include <cstdio>
#include <cstdlib>
#include <cstring>

using namespace klotski;

static int usage(const char *prog) {
  std::fprintf(stderr,
               "usage: %s [-v] [0x<hex bitboard> | \"<20-char board>\"]\n"
               "  board chars: . empty  o 1x1  < > horizontal 2x1  ^ v "
               "vertical 2x1  # 2x2 (four cells)\n",
               prog);
  return 2;
}

int main(int argc, char **argv) {
  State start = START;
  bool verbose = false;

  for (int i = 1; i < argc; ++i) {
    const char *a = argv[i];
    if (!std::strcmp(a, "-v")) {
      verbose = true;
    } else if (a[0] == '0' && (a[1] == 'x' || a[1] == 'X')) {
      char *end = nullptr;
      start = std::strtoull(a, &end, 16);
      if (end == a + 2 || *end)
        return usage(argv[0]);
    } else if (std::strlen(a) == size_t(N) &&
               std::strspn(a, ". o<>^v#") == size_t(N)) {
      start = from_rows(a);
    } else {
      return usage(argv[0]);
    }
  }

  // show the board before validating, so a malformed one is visible too
  std::printf("start board: 0x%016llx\n", (unsigned long long)start);
  print_board(start);
  std::putchar('\n');

  // the engine assumes a legal board, so check here for a proper message
  if (!valid(start)) {
    std::fputs("invalid board: a piece is cut off, overlaps, or extends past "
               "the edge\n",
               stderr);
    return 2;
  }

  const auto t0 = std::chrono::steady_clock::now();
  const auto path = klotski::f(start); // unsolvable -> "N", exit code 1
  const double ms = std::chrono::duration<double, std::milli>(
                        std::chrono::steady_clock::now() - t0)
                        .count();

  std::printf("solved in %.2f ms\n", ms);
  std::printf("shortest solution: %zu moves (one piece, one cell per move)\n",
              path.size() - 1);
  if (verbose)
    for (State s : path) {
      std::putchar('\n');
      print_board(s);
    }
  return 0;
}
