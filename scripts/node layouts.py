a="""x

xx

xxx

xx
xx

xxx
xx

xxx
xxx

xx
xxx
xx

xxx
xx
xxx

xxx
xxx
xxx

xxx
xxxx
xxx

xxxx
xxx
xxxx

xxxx
xxxx
xxxx

xxxx
xxxxx
xxxx

xxxxx
xxxx
xxxxx

xxxxx
xxxxx
xxxxx

# (15 thus far - need to get to 58)

# we've gotten to 5x3, i.e. floor(f * 3) x 3
# we go to 4 now. staggering is always preferable.
# on that note, we could've gone to 4 at 15 (to avoid... the business)

# it seems like the business is unavoidable. maybe we allow one instance of the business?

xxxx
xxxx
xxxx
xxxx

xxx
xxxx
xxx
xxxx
xxx

xxxx
xxx
xxxx
xxx
xxxx

xxx
xxxx
xxxxx
xxxx
xxx

xxxx
xxxx
xxxx
xxxx
xxxx

xxx
xxxxx
xxxxx
xxxxx
xxx

xxxx
xxxxx
xxxx
xxxxx
xxxx

xxxxx
xxxx
xxxxx
xxxx
xxxxx

xxxx
xxxxx
xxxxxx
xxxxx
xxxx

xxxxx
xxxxx
xxxxx
xxxxx
xxxxx

xxxx
xxxxxx
xxxxxx
xxxxxx
xxxx

xxxxx
xxxxxx
xxxxx
xxxxxx
xxxxx

xxxxxx
xxxxx
xxxxxx
xxxxx
xxxxxx

xxxxx
xxxxxx
xxxxxxx
xxxxxx
xxxxx

xxxxxx
xxxxxx
xxxxxx
xxxxxx
xxxxxx

# 30. we get to floor (5*5/3) = 8

xxxxx
xxxxxxx
xxxxxxx
xxxxxxx
xxxxx

xxxxxx
xxxxxxx
xxxxxx
xxxxxxx
xxxxxx

xxxxxxx
xxxxxx
xxxxxxx
xxxxxx
xxxxxxx

xxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxx

xxxxxxx
xxxxxxx
xxxxxxx
xxxxxxx
xxxxxxx

# 35

xxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxx

xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxxx

xxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx

# 40. 8. Hmmmm...
# we sort of want to stay at 6, since 7 is a lot, but it is a bit more painful

xxxxxxx
xxxxxxx
xxxxxxx
xxxxxxx
xxxxxxx
xxxxxx

xxxxxx
xxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxx
xxxxxx

xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxx

xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxxx
xxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxx
xxxxxxxx

xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxx

# 48

xxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxx

xxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxxx
xxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxx
xxxxxxxxx

xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxx

# we are up to 56

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

# 58. Woo!

xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx

xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx

# up to 60...
# 7*8 + 5 = 61

xxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxx

xxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx
xxxxxxxxx
xxxxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxx

xxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxx

xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx

xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx

xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx

xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx

xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx
xxxxxxxxxxx

"""

b = a.split("\n")
c = [line for line in b if not line.startswith("#")]

import re

d = "/".join(c)
e = re.sub("//+","//",d)
f = e.split("//")
g = [list(map(len,x.split("/")))for x in f][:-1]

assert all((i+1 == sum(x) for i,x in enumerate(g)))
print(g)
