import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Send, FileText, Check, X, AlertTriangle, Eye, Printer, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Template {
  id: string;
  name: string;
  content: string;
  created_at: string;
}

interface Field {
  id: string;
  template_id: string;
  name: string;
  key: string;
}

interface Invoice {
  id: string;
  user_id: string;
  template_id: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  email: string;
  sent_at: string | null;
  created_at: string;
  users?: { email: string };
  billing_templates?: { name: string };
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export function BillingTab() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
    loadInvoices();
  }, []);

  async function loadTemplates() {
    try {
      const { data, error } = await supabase
        .from('billing_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      setError('Erreur lors du chargement des modèles');
    }
  }

  async function loadFields(templateId: string) {
    try {
      const { data, error } = await supabase
        .from('billing_fields')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at');

      if (error) throw error;
      setFields(data || []);
    } catch (err) {
      console.error('Error loading fields:', err);
      setError('Erreur lors du chargement des champs');
    }
  }

  async function loadInvoices() {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          users (email),
          billing_templates (name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error loading invoices:', err);
      setError('Erreur lors du chargement des factures');
    }
  }

  async function handleTemplateSelect(template: Template) {
    setSelectedTemplate(template);
    await loadFields(template.id);
    setShowTemplateModal(true);
  }

  async function handleDeleteTemplate(templateId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) return;

    try {
      const { error } = await supabase
        .from('billing_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      if (selectedTemplate?.id === templateId) {
        setSelectedTemplate(null);
        setFields([]);
      }
    } catch (err) {
      console.error('Error deleting template:', err);
      setError('Erreur lors de la suppression du modèle');
    }
  }

  function handlePreviewInvoice(invoice: Invoice) {
    setSelectedInvoice(invoice);
    setShowPreviewModal(true);
  }

  async function handleDeleteInvoice(invoiceId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) return;

    try {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;

      await loadInvoices();
    } catch (err) {
      console.error('Error deleting invoice:', err);
      setError('Erreur lors de la suppression de la facture');
    }
  }

  async function handleSendInvoice(invoiceId: string) {
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', invoiceId);

      if (error) throw error;

      await loadInvoices();
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError('Erreur lors de l\'envoi de la facture');
    }
  }

  return (
    <div className="space-y-8 max-w-screen-2xl mx-auto p-6">
      {error && (
        <div className="p-4 bg-white border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* En-tête avec boutons d'action */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-medium text-gray-800">
          Gestion de la facturation
        </h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSelectedTemplate(null);
              setShowTemplateModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau modèle
          </button>
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Nouvelle facture
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau latéral des modèles */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Modèles de facture</h4>
            <div className="space-y-4">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-sm">Aucun modèle disponible</p>
              ) : (
                templates.map(template => (
                  <div
                    key={template.id}
                    className={`bg-gray-50 rounded-lg p-4 border transition-all duration-300 ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h5 className="font-medium text-gray-700">{template.name}</h5>
                        <p className="text-xs text-gray-500">
                          {new Date(template.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTemplateSelect(template)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-500 hover:text-red-700 p-1 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Liste des factures */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h4 className="text-lg font-medium text-gray-800 mb-4">Factures</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium">Client</th>
                    <th className="text-left py-3 px-4 text-sm font-medium">Modèle</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Montant</th>
                    <th className="text-center py-3 px-4 text-sm font-medium">Statut</th>
                    <th className="text-right py-3 px-4 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        Aucune facture disponible
                      </td>
                    </tr>
                  ) : (
                    invoices.map(invoice => (
                      <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-4 text-gray-600">{invoice.users?.email}</td>
                        <td className="py-4 px-4 text-gray-600">{invoice.billing_templates?.name}</td>
                        <td className="py-4 px-4 text-right text-gray-600 font-medium">
                          {invoice.amount.toFixed(2)} €
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              invoice.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-700'
                                : invoice.status === 'sent'
                                ? 'bg-blue-100 text-blue-700'
                                : invoice.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {invoice.status === 'paid' && 'Payée'}
                              {invoice.status === 'sent' && 'Envoyée'}
                              {invoice.status === 'cancelled' && 'Annulée'}
                              {invoice.status === 'draft' && 'Brouillon'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handlePreviewInvoice(invoice)}
                              className="text-gray-600 hover:text-gray-800 p-1 rounded"
                              title="Prévisualiser"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {invoice.status === 'draft' && (
                              <button
                                onClick={() => handleSendInvoice(invoice.id)}
                                className="text-blue-500 hover:text-blue-700 p-1 rounded"
                                title="Envoyer"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="text-gray-600 hover:text-gray-800 p-1 rounded"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {invoice.status === 'draft' && (
                              <button
                                onClick={() => handleDeleteInvoice(invoice.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <TemplateModal
              onClose={() => setShowTemplateModal(false)}
              onSuccess={() => {
                loadTemplates();
                setShowTemplateModal(false);
              }}
              template={selectedTemplate}
            />
          </div>
        </div>
      )}

      {showInvoiceModal && (
        <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <InvoiceModal
              onClose={() => setShowInvoiceModal(false)}
              onSuccess={() => {
                loadInvoices();
                setShowInvoiceModal(false);
              }}
              templates={templates}
            />
          </div>
        </div>
      )}

      {showPreviewModal && selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <InvoicePreviewModal
              invoice={selectedInvoice}
              onClose={() => setShowPreviewModal(false)}
              template={templates.find(t => t.id === selectedInvoice.template_id) || null}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface TemplateModalProps {
  onClose: () => void;
  onSuccess: () => void;
  template?: Template | null;
}

function TemplateModal({ onClose, onSuccess, template }: TemplateModalProps) {
  const [name, setName] = useState(template?.name || '');
  const [content, setContent] = useState(template?.content || '');
  const [previewData, setPreviewData] = useState({
    client_name: 'Société Exemple',
    client_address: '123 Rue de l\'Exemple, 75000 Paris',
    invoice_number: 'FACT-2023-001',
    invoice_date: new Date().toLocaleDateString(),
    payment_terms: '30 jours',
    items: [
      { description: 'Service 1', quantity: 1, price: 100, total: 100 },
      { description: 'Service 2', quantity: 2, price: 75, total: 150 }
    ],
    subtotal: 250,
    tax: 50,
    total: 300
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (template) {
        const { error: updateError } = await supabase
          .from('billing_templates')
          .update({ name, content })
          .eq('id', template.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('billing_templates')
          .insert([{ name, content }]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      console.error('Error saving template:', err);
      setError('Erreur lors de l\'enregistrement du modèle');
    } finally {
      setSaving(false);
    }
  }

  // Remplacement des variables dans le contenu du modèle pour la prévisualisation
  function getPreviewContent() {
    let previewContent = content;
    
    Object.entries(previewData).forEach(([key, value]) => {
      if (typeof value === 'object') return;
      const regex = new RegExp(`{{${key}}}`, 'g');
      previewContent = previewContent.replace(regex, String(value));
    });

    // Traitement spécial pour les éléments de facture (tableau)
    if (previewContent.includes('{{items}}')) {
      const itemsHtml = previewData.items.map(item => `
        <tr>
          <td>${item.description}</td>
          <td>${item.quantity}</td>
          <td>${item.price.toFixed(2)} €</td>
          <td>${item.total.toFixed(2)} €</td>
        </tr>
      `).join('');
      
      previewContent = previewContent.replace('{{items}}', itemsHtml);
    }

    return previewContent;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-800">
          {template ? 'Modifier le modèle' : 'Nouveau modèle'}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? 'Éditer' : 'Prévisualiser'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {showPreview ? (
        <div className="border rounded-lg p-6 bg-white min-h-[500px]">
          <div className="mb-4 flex justify-between">
            <h4 className="text-lg font-medium text-gray-700">Prévisualisation</h4>
            <div className="flex gap-2">
              <button className="text-gray-600 hover:text-gray-800 p-1 rounded-lg">
                <Printer className="w-4 h-4" />
              </button>
              <button className="text-gray-600 hover:text-gray-800 p-1 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du modèle
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Ex: Facture standard"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenu HTML
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-96 font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Contenu HTML du modèle avec variables (ex: {{client_name}})"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Utilisez les variables {{client_name}}, {{client_address}}, {{invoice_number}}, etc.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {template ? 'Mettre à jour' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface InvoiceModalProps {
  onClose: () => void;
  onSuccess: () => void;
  templates: Template[];
}

function InvoiceModal({ onClose, onSuccess, templates }: InvoiceModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [email, setEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(`FACT-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [newItem, setNewItem] = useState<{description: string, quantity: string, price: string}>({
    description: '',
    quantity: '1',
    price: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addItem() {
    if (!newItem.description || !newItem.price) return;
    
    const quantity = parseFloat(newItem.quantity) || 1;
    const price = parseFloat(newItem.price);
    const total = quantity * price;
    
    setItems([
      ...items,
      {
        description: newItem.description,
        quantity,
        price,
        total
      }
    ]);
    
    setNewItem({
      description: '',
      quantity: '1',
      price: ''
    });
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function getTotalAmount() {
    return items.reduce((sum, item) => sum + item.total, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('invoices')
        .insert([{
          template_id: selectedTemplate,
          email,
          amount: getTotalAmount(),
          status: 'draft'
        }]);

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError('Erreur lors de la création de la facture');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-800">
          Nouvelle facture
        </h3>
        <div className="flex gap-2">
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Éditer' : 'Prévisualiser'}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 border border-red-200 rounded-xl flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {showPreview ? (
        <div className="border rounded-lg p-6 bg-white">
          <div className="mb-4 flex justify-between">
            <h4 className="text-lg font-medium text-gray-700">Prévisualisation de la facture</h4>
            <div className="flex gap-2">
              <button className="text-gray-600 hover:text-gray-800 p-1 rounded-lg">
                <Printer className="w-4 h-4" />
              </button>
              <button className="text-gray-600 hover:text-gray-800 p-1 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">FACTURE</h2>
                <p className="text-gray-600">Numéro: {invoiceNumber}</p>
                <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <h3 className="text-xl font-bold text-gray-800">Votre Entreprise</h3>
                <p className="text-gray-600">Adresse de l'entreprise</p>
                <p className="text-gray-600">contact@example.com</p>
              </div>
            </div>

            <div className="border-t border-b border-gray-300 py-4">
              <h4 className="font-medium text-gray-800 mb-2">Facturer à:</h4>
              <p className="text-gray-700 font-medium">{clientName}</p>
              <p className="text-gray-600">{clientAddress}</p>
              <p className="text-gray-600">{email}</p>
            </div>

            <div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-2 text-gray-700">Description</th>
                    <th className="text-center py-2 text-gray-700">Quantité</th>
                    <th className="text-right py-2 text-gray-700">Prix unitaire</th>
                    <th className="text-right py-2 text-gray-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 text-gray-800">{item.description}</td>
                      <td className="py-3 text-center text-gray-800">{item.quantity}</td>
                      <td className="py-3 text-right text-gray-800">{item.price.toFixed(2)} €</td>
                      <td className="py-3 text-right text-gray-800">{item.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3} className="py-3 text-right font-medium text-gray-800">Total:</td>
                    <td className="py-3 text-right font-bold text-gray-800">{getTotalAmount().toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="border-t border-gray-300 pt-4 text-gray-600">
              <p>Merci pour votre confiance. Pour toute question concernant cette facture, veuillez nous contacter.</p>
              <p>Conditions de paiement: 30 jours</p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Modèle
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  >
                    <option value="">Sélectionner un modèle</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email du client
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="client@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Société du client"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse du client
                  </label>
                  <textarea
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Adresse complète du client"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-800 mb-4">Articles</h4>
              
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-6">
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Description"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Qté"
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Prix €"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={addItem}
                      className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-2 px-4 text-sm font-medium text-gray-700">Description</th>
                        <th className="text-center py-2 px-2 text-sm font-medium text-gray-700">Qté</th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-700">Prix</th>
                        <th className="text-right py-2 px-2 text-sm font-medium text-gray-700">Total</th>
                        <th className="text-center py-2 px-1 text-sm font-medium text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-gray-500">
                            Aucun article ajouté
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={index} className="border-t border-gray-200">
                            <td className="py-3 px-4 text-gray-800">{item.description}</td>
                            <td className="py-3 px-2 text-center text-gray-800">{item.quantity}</td>
                            <td className="py-3 px-2 text-right text-gray-800">{item.price.toFixed(2)} €</td>
                            <td className="py-3 px-2 text-right text-gray-800">{item.total.toFixed(2)} €</td>
                            <td className="py-3 px-1 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {items.length > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={3} className="py-3 px-4 text-right font-medium text-gray-800">Total:</td>
                          <td className="py-3 px-2 text-right font-bold text-gray-800">{getTotalAmount().toFixed(2)} €</td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || items.length === 0}
              className={`bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${(saving || items.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>
                  <span className="animate-spin">⌛</span>
                  Création...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Créer
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface InvoicePreviewModalProps {
  invoice: Invoice;
  template: Template | null;
  onClose: () => void;
}

function InvoicePreviewModal({ invoice, template, onClose }: InvoicePreviewModalProps) {
  const [invoiceContent, setInvoiceContent] = useState<string>('');

  useEffect(() => {
    if (template) {
      // Préparation du contenu avec données réelles de la facture
      let content = template.content;
      
      // Remplacer les variables par les valeurs réelles
      content = content.replace(/{{invoice_number}}/g, `FACT-${invoice.id.substring(0, 8)}`);
      content = content.replace(/{{invoice_date}}/g, new Date(invoice.created_at).toLocaleDateString());
      content = content.replace(/{{client_email}}/g, invoice.email);
      content = content.replace(/{{amount}}/g, `${invoice.amount.toFixed(2)} €`);
      
      setInvoiceContent(content);
    }
  }, [invoice, template]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-gray-800">
          Prévisualisation de la facture
        </h3>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 text-emerald-600 hover:text-emerald-800 border border-emerald-200 hover:border-emerald-300 rounded-lg flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Télécharger
          </button>
          <button
            className="px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 p-2 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-white min-h-[600px]">
        {template ? (
          <div dangerouslySetInnerHTML={{ __html: invoiceContent }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-[600px] text-gray-500">
            <AlertTriangle className="w-12 h-12 mb-4" />
            <p>Modèle de facture non trouvé ou supprimé.</p>
          </div>
        )}
      </div>
    </div>
  );
}