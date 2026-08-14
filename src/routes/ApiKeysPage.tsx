import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, KeyRound, Plus, ShieldAlert, Trash2 } from "lucide-react";
import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";

import type { ApiApiKeyResponse, ApiCreateAPIKeyResponse } from "@/api/api.schemas";
import { useDeleteAuthApiKeysKeyId, useGetAuthApiKeys, usePostAuthApiKeys } from "@/api/auth/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRelativeTime } from "@/lib/utils";
import { ApiError } from "@/mutator";

import { AuthPage } from "./UserProfilePage";

export function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("access_token")),
  );
  const [name, setName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiCreateAPIKeyResponse | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiApiKeyResponse | null>(null);
  const apiKeysQuery = useGetAuthApiKeys({ query: { enabled: isAuthenticated } });
  const createMutation = usePostAuthApiKeys();
  const revokeMutation = useDeleteAuthApiKeysKeyId();

  useEffect(() => {
    const handleSessionExpired = () => setIsAuthenticated(false);
    window.addEventListener("blue_book:session-expired", handleSessionExpired);
    return () => window.removeEventListener("blue_book:session-expired", handleSessionExpired);
  }, []);

  const handleCreate = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const keyName = name.trim();
    if (!keyName) return;
    try {
      const apiKey = await createMutation.mutateAsync({ data: { name: keyName } });
      setCreatedKey(apiKey);
      setName("");
      await queryClient.invalidateQueries({ queryKey: apiKeysQuery.queryKey });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.msg : "创建 API Key 失败");
    }
  };

  const copyKey = async () => {
    if (!createdKey) return;
    try {
      await navigator.clipboard.writeText(createdKey.key);
      toast.success("API Key 已复制");
    } catch {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleRevoke = async () => {
    if (!keyToRevoke) return;
    try {
      await revokeMutation.mutateAsync({ keyId: keyToRevoke.id });
      setKeyToRevoke(null);
      await queryClient.invalidateQueries({ queryKey: apiKeysQuery.queryKey });
      toast.success("API Key 已撤销");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.msg : "撤销 API Key 失败");
    }
  };

  if (!isAuthenticated) return <AuthPage onAuthenticated={() => setIsAuthenticated(true)} />;

  const keys = apiKeysQuery.data ?? [];

  return (
    <>
      <header className="border-border/60 bg-background/95 sticky top-0 z-30 flex h-12 items-center gap-2 border-b px-3 backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="返回个人主页"
          nativeButton={false}
          render={<Link to="/me" />}
        >
          <ArrowLeft />
        </Button>
        <h1 className="text-base font-semibold">API Key</h1>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 p-4 pb-8">
        <section className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">访问密钥</h2>
            <p className="text-muted-foreground mt-1 text-sm">用于在命令行中安全访问你的账户。</p>
          </div>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              placeholder="例如：本地开发"
              aria-label="API Key 名称"
              className="h-9"
            />
            <Button type="submit" size="lg" disabled={!name.trim() || createMutation.isPending}>
              <Plus />
              创建
            </Button>
          </form>
        </section>

        {createdKey && (
          <section className="border-primary/30 bg-primary/5 space-y-3 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Check className="text-primary mt-0.5 size-4" />
              <div>
                <h2 className="text-sm font-semibold">已创建 {createdKey.name}</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  请立即复制，此完整密钥只会显示一次。
                </p>
              </div>
            </div>
            <div className="bg-background flex items-center gap-2 rounded-md border p-2">
              <code className="min-w-0 flex-1 text-xs break-all">{createdKey.key}</code>
              <Button variant="outline" size="icon-sm" aria-label="复制 API Key" onClick={copyKey}>
                <Copy />
              </Button>
            </div>
          </section>
        )}

        {keyToRevoke && (
          <section className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
            <ShieldAlert className="text-destructive size-5 shrink-0" />
            <p className="flex-1 text-sm">撤销后，{keyToRevoke.name} 将无法再用于 CLI 访问。</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setKeyToRevoke(null)}>
                取消
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={revokeMutation.isPending}
                onClick={handleRevoke}
              >
                确认撤销
              </Button>
            </div>
          </section>
        )}

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">已创建的密钥</h2>
            <span className="text-muted-foreground text-xs">{keys.length} 个</span>
          </div>
          {apiKeysQuery.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            </div>
          ) : apiKeysQuery.isError ? (
            <p className="text-muted-foreground py-10 text-center text-sm">API Key 加载失败</p>
          ) : keys.length ? (
            <div className="space-y-2">
              {keys.map((apiKey) => (
                <ApiKeyItem
                  key={apiKey.id}
                  apiKey={apiKey}
                  onRevoke={() => setKeyToRevoke(apiKey)}
                />
              ))}
            </div>
          ) : (
            <Empty className="border-border rounded-lg border py-14">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <KeyRound />
                </EmptyMedia>
                <EmptyTitle>还没有 API Key</EmptyTitle>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </main>
    </>
  );
}

function ApiKeyItem({ apiKey, onRevoke }: { apiKey: ApiApiKeyResponse; onRevoke: () => void }) {
  const revoked = Boolean(apiKey.revoked_at);
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <Avatar size="default" className="bg-muted">
          <AvatarFallback>
            <KeyRound className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{apiKey.name}</p>
            {revoked && <Badge variant="secondary">已撤销</Badge>}
          </div>
          <p className="text-muted-foreground mt-1 font-mono text-xs">{apiKey.key_prefix}...</p>
          <p className="text-muted-foreground mt-1 text-xs">
            创建于 {formatRelativeTime(apiKey.created_at)}
            {apiKey.last_used_at && ` · 最近使用 ${formatRelativeTime(apiKey.last_used_at)}`}
          </p>
        </div>
        {!revoked && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`撤销 ${apiKey.name}`}
            onClick={onRevoke}
          >
            <Trash2 className="text-destructive" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
