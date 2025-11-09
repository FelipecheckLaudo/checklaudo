import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

interface CrudOperationsConfig<T> {
  getFn: () => Promise<T[]>;
  saveFn: (data: any) => Promise<T>;
  updateFn: (id: string, data: any) => Promise<T>;
  deleteFn: (id: string) => Promise<void>;
}

/**
 * Custom hook for unified CRUD operations
 * Reduces boilerplate code for data management
 */
export function useCrudOperations<T extends { id: string }>({
  getFn,
  saveFn,
  updateFn,
  deleteFn,
}: CrudOperationsConfig<T>) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getFn();
      setData(result);
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "carregar dados");
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [getFn]);

  const save = useCallback(async (itemData: any): Promise<T | null> => {
    try {
      setIsSaving(true);
      const result = await saveFn(itemData);
      await loadData();
      toast.success("Item cadastrado com sucesso!");
      return result;
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "cadastrar item");
      toast.error(friendlyMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [saveFn, loadData]);

  const update = useCallback(async (id: string, itemData: any): Promise<T | null> => {
    try {
      setIsSaving(true);
      const result = await updateFn(id, itemData);
      await loadData();
      toast.success("Item atualizado com sucesso!");
      return result;
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "atualizar item");
      toast.error(friendlyMessage);
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [updateFn, loadData]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteFn(id);
      await loadData();
      toast.success("Item excluído com sucesso!");
      return true;
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "excluir item");
      toast.error(friendlyMessage);
      return false;
    }
  }, [deleteFn, loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    isSaving,
    loadData,
    save,
    update,
    remove,
  };
}
