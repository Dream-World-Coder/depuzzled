#import<bits/stdc++.h>
#import"g.hpp"
namespace klotski{auto f(State s){std::map p{std::pair(s,s-s)};std::list q(valid(s),s);for(auto c:q){if(is_goal(c)){for(q={c};c=p[c];)q.push_front(c);return q;}MoveList m;gen_moves(c,m);while(m.n--)if(p.emplace(m.s[m.n],c).second)q.push_back(m.s[m.n]);}puts("N");exit(1);}}