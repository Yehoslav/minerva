# 1
## Cerinţa

Se citeşte un număr natural nenul `n`. Să se afişeze, în ordine invers lexicografică, permutările mulţimii `{1,2,..,n}`

``` c
#include <stdio.h>

int n,x[10];
void bk(int k)
{
    if(k==n+1)
    {
        for(int i=1;i<=n;i++)
        {
            printf("%d ", x[i]);
        }
        printf("\n");
    }
    else
    {
        for(int i=n;i>=1;i--)
        {
            x[k]=i;
            int ok=1;
            for(int j=1;j<=k-1;j++)
            {
                if(x[j]==x[k])
                {
                    ok=0;
                    break;
                }
            }
            if(ok==1)
            {
                bk(k+1);
            }
        }
    }
}
int main()
{
    scanf("%d", &n);
    bk(1);
    return 0;
}
```


# 2
## Cerința

Se citesc două numere `a` și `b`. Să se afișeze, în ordine lexicografică, permutările mulțimii `{a, a + 1, ..., b}`.

``` c
#include <stdio.h>

int n,a,b,x[10];
void bk(int k)
{
    if(k==n+1)
    {
        for(int i=1;i<=n;i++)
        {
            printf("%d ", x[i]+a-1);
        }
        printf("\n");
    }
    else
    {
        for(int i=1;i<=n;i++)
        {
            x[k]=i;
            int ok=1;
            for(int j=1;j<=k-1;j++)
            {
                if(x[j]==x[k])
                {
                    ok=0;
                    break;
                }
            }
            if(ok==1)
            {
                bk(k+1);
            }
        }
    }
}
int main()
{
    scanf("%d%d", &a, &b);
    n=b-a+1;
    bk(1);
    return 0;
}
```


# 3
## Cerința

Se consideră o tablă de șah de dimensiune `n`. Să se plaseze pe tablă `n` regine astfel încât să nu existe două regine care să se atace.

``` c
#include <stdio.h>
int n,x[14],f[14],r,nr;

void bk(int k)
{
    if(nr>0) return;
    if(k==n+1)
    {
        nr++;
        for(int i=1;i<=n;i++)
        {
            for (int j = 1; j <= n; ++j) {
                if(j==x[i]) 
                    printf("*");
                else 
                    printf("-");
            }
            printf("\n");
        }
    }
    else {
        for (int i = 1; i <= n; i++) {
            x[k] = i;
            int ok = 1;
            if(f[i]>0) ok=0;
            for(int j=1; j<=k-1; j++){
                if(abs(x[k]-x[j])==k-j) {
                    ok=0;
                    break;
                }
            }
            if (ok == 1) {
                f[i]++;
                bk(k+1);
                f[i]--;
            }
        }
    }
}

int main()
{
    scanf("%d", &n);
    bk(1);
    return 0;
}

```

# 4
## Cerinţa

Se citeşte un număr natural nenul `n`. Să se afişeze, în ordine lexicografică, permutările fără puncte fixe ale mulţimii `{1,2,..,n}`. Fie mulţimea `M={1,2,..,n}` şi `P(1),P(2),...,P(n)` o permutare a ei. Elementul `x` din `M` se numeşte punct fix dacă `P(x)=x`.

``` c
#include <stdio.h>

int n,x[10];
void bk(int k)
{
    if(k==n+1)
    {
        for(int i=1;i<=n;i++)
        {
            printf("%d ", x[i]);
        }
        printf("\n");
    }
    else
    {
        for(int i=1;i<=n;i++)
        {
            x[k]=i;
            int ok=1;
            for(int j=1;j<=k-1;j++)
            {
                if(x[j]==x[k]) {
                    ok = 0;
                    break;
                }
            }
            if(x[k]==k) ok=0;
            if(ok==1)
            {
                bk(k+1);
            }
        }
    }
}
int main()
{
    scanf("%d", &n);
    bk(1);
    return 0;
}
```

# 5
## Cerinţa

Se dă un cuvânt din cel mult `8` litere distincte. Să se afișeze, în ordine alfabetică, toate anagramele acestui cuvânt. Se numește _anagramă_ a unui cuvânt dat, un alt cuvânt ce conține toate literele primului, eventual în altă ordine.

``` c
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int x[10], n;
char a[11];

void bk(int k) {
    if (k == n + 1) {
        for (int i = 1; i <= n; i++) {
            printf("%c", a[x[i]]);
        }
        printf("\n");
    } else {
        for (int i = 1; i <= n; i++) {
            x[k] = i;
            int ok = 1;
            for (int j = 1; j < k; j++) {
                if (x[j] == x[k]) {
                    ok = 0;
                    break;
                }
            }
            if (ok == 1) {
                bk(k + 1);
            }
        }
    }
}

int main() {
    printf("Enter the string: ");
    scanf("%s", a + 1);
    n = strlen(a + 1);

    qsort(a + 1, n, sizeof(char), (int (*)(const void *, const void *)) strcmp);

    bk(1);
    return 0;
}
```
