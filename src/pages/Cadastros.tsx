import { useState, useEffect } from "react";
import { Plus, Users, UserCheck, UserCog, Trash2, Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CadastroDialog } from "@/components/CadastroDialog";
import {
  getClientes,
  getVisitadores,
  getDigitadores,
  saveCliente,
  saveVisitador,
  saveDigitador,
  updateCliente,
  updateVisitador,
  updateDigitador,
  deleteCliente,
  deleteVisitador,
  deleteDigitador,
  type Cliente,
  type Visitador,
  type Digitador,
} from "@/lib/database";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/lib/errorHandler";

export default function Cadastros() {
  const [activeTab, setActiveTab] = useState("clientes");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [visitadores, setVisitadores] = useState<Visitador[]>([]);
  const [digitadores, setDigitadores] = useState<Digitador[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [clientesData, visitadoresData, digitadoresData] = await Promise.all([
        getClientes(),
        getVisitadores(),
        getDigitadores()
      ]);
      setClientes(clientesData);
      setVisitadores(visitadoresData);
      setDigitadores(digitadoresData);
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "carregar dados");
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: { nome: string; cpf: string; observacoes: string; foto_url?: string }) => {
    try {
      setIsSaving(true);
      
      if (editingItem) {
        // Modo edição
        if (activeTab === "clientes") {
          await updateCliente(editingItem.id, data);
        } else if (activeTab === "visitadores") {
          await updateVisitador(editingItem.id, data);
        } else {
          await updateDigitador(editingItem.id, data);
        }
        toast.success("Cadastro atualizado com sucesso!");
      } else {
        // Modo criação
        if (activeTab === "clientes") {
          await saveCliente(data);
        } else if (activeTab === "visitadores") {
          await saveVisitador(data);
        } else {
          await saveDigitador(data);
        }
        toast.success("Cadastro salvo com sucesso!");
      }
      
      await loadData();
      setEditingItem(null);
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "salvar cadastro");
      toast.error(friendlyMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    
    try {
      if (activeTab === "clientes") {
        await deleteCliente(selectedId);
      } else if (activeTab === "visitadores") {
        await deleteVisitador(selectedId);
      } else {
        await deleteDigitador(selectedId);
      }
      
      await loadData();
      setDeleteDialogOpen(false);
      setSelectedId(null);
      toast.success("Registro excluído com sucesso!");
    } catch (error: any) {
      const friendlyMessage = getUserFriendlyError(error, "excluir registro");
      toast.error(friendlyMessage);
    }
  };

  const DataTable = ({ data }: { data: any[] }) => {
    if (isLoading) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      );
    }

    if (data.length === 0) {
      return (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              {activeTab === "clientes" && <Users className="h-8 w-8 text-muted-foreground" />}
              {activeTab === "visitadores" && <UserCheck className="h-8 w-8 text-muted-foreground" />}
              {activeTab === "digitadores" && <UserCog className="h-8 w-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Clique no botão "Novo" para adicionar o primeiro registro
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead className="hidden md:table-cell">Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.cpf}</TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {item.observacoes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedId(item.id);
                          setDeleteDialogOpen(true);
                        }}
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  const getDialogTitle = () => {
    const prefix = editingItem ? "Editar" : "Novo";
    if (activeTab === "clientes") return `${prefix} Cliente`;
    if (activeTab === "visitadores") return `${prefix} Visitador`;
    return `${prefix} Digitador`;
  };

  const getDialogDescription = () => {
    const action = editingItem ? "Edite os dados" : "Adicione um novo";
    if (activeTab === "clientes") return `${action} ${editingItem ? "do" : ""} cliente ${editingItem ? "no" : "ao"} sistema`;
    if (activeTab === "visitadores") return `${action} ${editingItem ? "do" : ""} visitador ${editingItem ? "no" : "ao"} sistema`;
    return `${action} ${editingItem ? "do" : ""} digitador ${editingItem ? "no" : "ao"} sistema`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Cadastros</h1>
          <p className="text-muted-foreground">Gerencie clientes, visitadores e digitadores</p>
        </div>
        
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
          size="lg"
        >
          <Plus className="h-5 w-5" />
          Novo
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="clientes" className="gap-2 py-3">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="visitadores" className="gap-2 py-3">
            <UserCheck className="h-4 w-4" />
            Vistoriadores
          </TabsTrigger>
          <TabsTrigger value="digitadores" className="gap-2 py-3">
            <UserCog className="h-4 w-4" />
            Digitadores
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="mt-6 animate-slide-in">
          <DataTable data={clientes} />
        </TabsContent>

        <TabsContent value="visitadores" className="mt-6 animate-slide-in">
          <DataTable data={visitadores} />
        </TabsContent>

        <TabsContent value="digitadores" className="mt-6 animate-slide-in">
          <DataTable data={digitadores} />
        </TabsContent>
      </Tabs>

      <CadastroDialog
        open={dialogOpen}
        onOpenChange={handleCloseDialog}
        title={getDialogTitle()}
        description={getDialogDescription()}
        onSave={handleSave}
        isSaving={isSaving}
        initialData={editingItem}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
